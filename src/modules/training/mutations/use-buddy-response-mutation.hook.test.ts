import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { actOnHook } from '../../../../tests/setup/render-with-providers.helper';
import { respondToBuddy } from '../services/respond-buddy.service';
import type { TrainingBuddy } from '../types/training.types';
import { useBuddyResponseMutation } from './use-buddy-response-mutation.hook';

vi.mock('../services/respond-buddy.service', () => ({ respondToBuddy: vi.fn() }));

const CONFIRMED: TrainingBuddy = {
  id: 'buddy-1',
  submissionId: 'sub-1',
  membershipId: 'membership-1',
  status: 'confirmed',
  respondedAtIso: '2026-07-19T18:00:00.000Z',
  createdAtIso: '2026-07-10T09:00:00.000Z',
};

function renderRespond(intent: 'confirm' | 'decline') {
  const onSuccess = vi.fn();
  const onError = vi.fn();
  actOnHook(
    () => useBuddyResponseMutation('team-1', { onSuccess, onError }),
    (api) => {
      api.respond({ buddyId: 'buddy-1', intent });
    },
  );
  return { onSuccess, onError };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useBuddyResponseMutation', () => {
  it('confirms a credit and reports success', async () => {
    vi.mocked(respondToBuddy).mockResolvedValue(CONFIRMED);

    const { onSuccess } = renderRespond('confirm');

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
    expect(respondToBuddy).toHaveBeenCalledWith('team-1', 'buddy-1', 'confirm');
  });

  it('routes a decline failure to the error callback', async () => {
    vi.mocked(respondToBuddy).mockRejectedValue(new Error('nope'));

    const { onSuccess, onError } = renderRespond('decline');

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('reports which row is busy while the answer is in flight', async () => {
    vi.mocked(respondToBuddy).mockReturnValue(new Promise(() => undefined));

    const rendered = actOnHook(
      () => useBuddyResponseMutation('team-1', { onSuccess: vi.fn(), onError: vi.fn() }),
      (api) => {
        api.respond({ buddyId: 'buddy-1', intent: 'confirm' });
      },
    );

    await waitFor(() => {
      expect(rendered.result.current.busyBuddyId).toBe('buddy-1');
    });
    expect(rendered.result.current.lastIntent).toBe('confirm');
  });
});
