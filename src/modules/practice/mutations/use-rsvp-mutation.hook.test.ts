import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { QueryClient } from '@/packages/query';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { buildPracticeSessionDetail } from '../../../../tests/factories/practice.factory';
import {
  createTestQueryClient,
  renderHookWithProviders,
} from '../../../../tests/setup/render-with-providers.helper';
import { RSVP_STATUS, type RsvpStatus } from '../constants/practice.constants';
import { practiceQueryKeys } from '../queries/practice.keys';
import { submitRsvp } from '../services/submit-rsvp.service';
import type { PracticeSessionDetail } from '../types/practice.types';
import { useRsvpMutation } from './use-rsvp-mutation.hook';

vi.mock('../services/submit-rsvp.service', () => ({ submitRsvp: vi.fn() }));

const SESSION_ID = 'sess-1';
const TEAM_ID = 'team-1';
const onSuccess = vi.fn();
const onError = vi.fn();

function seededClient(): { queryClient: QueryClient; detail: PracticeSessionDetail } {
  const queryClient = createTestQueryClient();
  const detail = buildPracticeSessionDetail({ id: SESSION_ID });
  queryClient.setQueryData(practiceQueryKeys.detail(TEAM_ID, SESSION_ID), detail);
  return { queryClient, detail };
}

function cached(queryClient: QueryClient): PracticeSessionDetail | undefined {
  return queryClient.getQueryData(practiceQueryKeys.detail(TEAM_ID, SESSION_ID));
}

function runMutation(queryClient: QueryClient, status: RsvpStatus) {
  const view = renderHookWithProviders(
    () => useRsvpMutation(TEAM_ID, SESSION_ID, { onSuccess, onError }),
    { queryClient },
  );
  act(() => {
    view.result.current.submit({ status, reasonCategory: null, version: 1 });
  });
  return view.result;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useRsvpMutation', () => {
  it('optimistically patches then commits the authoritative detail', async () => {
    const { queryClient } = seededClient();
    let resolveSubmit: (value: {
      status: RsvpStatus;
      reasonCategory: null;
      respondedAtIso: string;
      version: number;
      waitlisted: boolean;
    }) => void = () => undefined;
    vi.mocked(submitRsvp).mockReturnValue(
      new Promise((resolve) => {
        resolveSubmit = resolve;
      }),
    );

    runMutation(queryClient, RSVP_STATUS.going);

    await waitFor(() => {
      expect(cached(queryClient)?.rsvp.status).toBe(RSVP_STATUS.going);
    });

    act(() => {
      resolveSubmit({
        status: RSVP_STATUS.going,
        reasonCategory: null,
        respondedAtIso: '2026-07-24T10:00:00.000Z',
        version: 2,
        waitlisted: false,
      });
    });

    await waitFor(() => {
      expect(cached(queryClient)?.rsvp.version).toBe(2);
    });
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(submitRsvp).toHaveBeenCalledWith(TEAM_ID, SESSION_ID, {
      status: RSVP_STATUS.going,
      reasonCategory: null,
      version: 1,
    });
  });

  it('rolls back and flags a conflict on a version clash', async () => {
    const { queryClient } = seededClient();
    vi.mocked(submitRsvp).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Conflict }));

    const result = runMutation(queryClient, RSVP_STATUS.notGoing);

    await waitFor(() => {
      expect(result.current.isConflict).toBe(true);
    });
    expect(cached(queryClient)?.rsvp.status).toBe(RSVP_STATUS.noResponse);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: APP_ERROR_CODE.Conflict }),
    );
  });

  it('skips the optimistic patch and rollback when the detail is not cached', async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(submitRsvp).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Server }));

    const result = runMutation(queryClient, RSVP_STATUS.going);

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(cached(queryClient)).toBeUndefined();
    expect(onError).toHaveBeenCalledOnce();
  });

  it('does not invent a detail cache entry when an uncached mutation succeeds', async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(submitRsvp).mockResolvedValue({
      status: RSVP_STATUS.going,
      reasonCategory: null,
      respondedAtIso: '2026-07-24T10:00:00.000Z',
      version: 2,
      waitlisted: false,
    });

    runMutation(queryClient, RSVP_STATUS.going);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
    expect(cached(queryClient)).toBeUndefined();
  });

  it('resets the mutation error state', async () => {
    const { queryClient } = seededClient();
    vi.mocked(submitRsvp).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Server }));

    const result = runMutation(queryClient, RSVP_STATUS.maybe);
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    act(() => {
      result.current.reset();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
    expect(result.current.isConflict).toBe(false);
  });
});
