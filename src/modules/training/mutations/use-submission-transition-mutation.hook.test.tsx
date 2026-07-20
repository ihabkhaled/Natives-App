import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { resetAppHttpClientForTesting } from '@/packages/http';

import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { SUBMISSION_STATUS } from '../constants/training.constants';
import { trainingQueryKeys } from '../queries/training.keys';
import { useSubmissionTransitionMutation } from './use-submission-transition-mutation.hook';

const DETAIL = {
  submission: {
    id: 'sub-1',
    teamId: 'team-1',
    seasonId: null,
    membershipId: 'm-1',
    activityTypeId: 'type-gym',
    status: SUBMISSION_STATUS.submitted,
    performedOn: '2026-07-10',
    durationMinutes: 45,
    quantity: null,
    notes: null,
    recordVersion: 2,
    submittedAt: '2026-07-13T09:00:00.000Z',
    withdrawnAt: null,
    createdAt: '2026-07-10T09:00:00.000Z',
    updatedAt: '2026-07-13T09:00:00.000Z',
  },
  buddies: [],
  evidenceCount: 0,
};

let queryClient: QueryClient;

function wrapper(props: { readonly children: ReactNode }): React.JSX.Element {
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
}

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('useSubmissionTransitionMutation', () => {
  it('caches the reconciled claim and reports success', async () => {
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    installTestAppHttpClient([
      {
        method: 'POST',
        url: '/teams/team-1/activity-submissions/sub-1/submit',
        respond: () => ({ status: 200, data: DETAIL }),
      },
    ]);
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () => useSubmissionTransitionMutation('team-1', { onSuccess, onError: vi.fn() }),
      { wrapper },
    );

    result.current.run({ submissionId: 'sub-1', expectedRecordVersion: 1, intent: 'submit' });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(
        queryClient.getQueryData(trainingQueryKeys.submission('team-1', 'sub-1')),
      ).toBeDefined();
    });
  });

  it('reports a refused transition without caching anything', async () => {
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    installTestAppHttpClient([
      {
        method: 'POST',
        url: '/teams/team-1/activity-submissions/sub-1/withdraw',
        respond: () => ({ status: 409, data: { statusCode: 409, code: 'VERSION_CONFLICT' } }),
      },
    ]);
    const onError = vi.fn();
    const { result } = renderHook(
      () => useSubmissionTransitionMutation('team-1', { onSuccess: vi.fn(), onError }),
      { wrapper },
    );

    result.current.run({ submissionId: 'sub-1', expectedRecordVersion: 1, intent: 'withdraw' });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1);
    });
    expect(
      queryClient.getQueryData(trainingQueryKeys.submission('team-1', 'sub-1')),
    ).toBeUndefined();
  });
});
