import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetAppHttpClientForTesting, type TestRoute } from '@/packages/http';

import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';

import { SUBMISSION_STATUS } from '../constants/training.constants';
import type { TrainingSubmission } from '../types/training.types';
import { useSubmissionWorkflow } from './use-submission-workflow.hook';

const confirmMock = vi.fn();
const toastMock = vi.fn();

vi.mock('@/shared/ui', () => ({
  useConfirmAlert: () => ({ confirm: confirmMock }),
  useAppToast: () => ({ showToast: toastMock }),
}));

vi.mock('@/packages/i18n', () => ({
  useAppTranslation: () => ({ t: (key: string) => key, locale: 'en' }),
}));

const SUBMISSION: TrainingSubmission = {
  id: 'sub-1',
  teamId: 'team-1',
  seasonId: null,
  membershipId: 'm-1',
  activityTypeId: 'type-gym',
  status: SUBMISSION_STATUS.draft,
  performedOn: '2026-07-10',
  durationMinutes: 45,
  quantity: null,
  notes: null,
  recordVersion: 1,
  submittedAtIso: null,
  withdrawnAtIso: null,
  createdAtIso: '2026-07-10T09:00:00.000Z',
  updatedAtIso: '2026-07-10T09:00:00.000Z',
};

function detailPayload(status: string): unknown {
  return {
    submission: {
      id: SUBMISSION.id,
      teamId: SUBMISSION.teamId,
      seasonId: null,
      membershipId: SUBMISSION.membershipId,
      activityTypeId: SUBMISSION.activityTypeId,
      status,
      performedOn: SUBMISSION.performedOn,
      durationMinutes: SUBMISSION.durationMinutes,
      quantity: null,
      notes: null,
      recordVersion: 2,
      submittedAt: null,
      withdrawnAt: null,
      createdAt: SUBMISSION.createdAtIso,
      updatedAt: SUBMISSION.updatedAtIso,
    },
    buddies: [],
    evidenceCount: 0,
  };
}

function wireClient(routes: readonly TestRoute[]): void {
  installTestAppHttpClient(routes);
}

function wrapper(props: { readonly children: ReactNode }): React.JSX.Element {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{props.children}</QueryClientProvider>;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('useSubmissionWorkflow', () => {
  it('does nothing at all when there is no claim to act on', () => {
    wireClient([]);
    const { result } = renderHook(() => useSubmissionWorkflow('team-1', null), { wrapper });

    result.current.submit();

    expect(confirmMock).not.toHaveBeenCalled();
  });

  it('asks before submitting and stops when the member cancels', async () => {
    wireClient([]);
    confirmMock.mockResolvedValue(false);
    const { result } = renderHook(() => useSubmissionWorkflow('team-1', SUBMISSION), { wrapper });

    result.current.submit();

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalledTimes(1);
    });
    expect(result.current.isRunning).toBe(false);
  });

  it('submits with the record version once the member confirms', async () => {
    const seen: unknown[] = [];
    wireClient([
      {
        method: 'POST',
        url: '/teams/team-1/activity-submissions/sub-1/submit',
        respond: (request) => {
          seen.push(request.data);
          return { status: 200, data: detailPayload(SUBMISSION_STATUS.submitted) };
        },
      },
    ]);
    confirmMock.mockResolvedValue(true);
    const { result } = renderHook(() => useSubmissionWorkflow('team-1', SUBMISSION), { wrapper });

    result.current.submit();

    await waitFor(() => {
      expect(seen).toEqual([{ expectedRecordVersion: 1 }]);
    });
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }));
    });
  });

  it('withdraws through its own endpoint', async () => {
    const seen: string[] = [];
    wireClient([
      {
        method: 'POST',
        url: '/teams/team-1/activity-submissions/sub-1/withdraw',
        respond: (request) => {
          seen.push(JSON.stringify(request.data));
          return { status: 200, data: detailPayload(SUBMISSION_STATUS.withdrawn) };
        },
      },
    ]);
    confirmMock.mockResolvedValue(true);
    const { result } = renderHook(() => useSubmissionWorkflow('team-1', SUBMISSION), { wrapper });

    result.current.withdraw();

    await waitFor(() => {
      expect(seen).toHaveLength(1);
    });
  });

  it('reports a rejected transition instead of pretending it succeeded', async () => {
    wireClient([
      {
        method: 'POST',
        url: '/teams/team-1/activity-submissions/sub-1/submit',
        respond: () => ({ status: 409, data: { statusCode: 409, code: 'VERSION_CONFLICT' } }),
      },
    ]);
    confirmMock.mockResolvedValue(true);
    const { result } = renderHook(() => useSubmissionWorkflow('team-1', SUBMISSION), { wrapper });

    result.current.submit();

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
    });
  });
});
