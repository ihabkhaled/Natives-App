import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { actOnHook } from '../../../../tests/setup/render-with-providers.helper';
import { recordScorekeeperAction } from '../services/record-scorekeeper-action.service';
import { useScorekeeperActionMutation } from './use-scorekeeper-action-mutation.hook';
import type { ScorekeeperActionStatus } from '../types/matches.types';

const { triggerHapticImpact } = vi.hoisted(() => ({ triggerHapticImpact: vi.fn() }));

vi.mock('@/packages/capacitor-haptics', () => ({
  HAPTIC_IMPACT: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  triggerHapticImpact,
}));
vi.mock('../services/record-scorekeeper-action.service', () => ({
  recordScorekeeperAction: vi.fn(),
}));

const POINT = {
  payload: {
    kind: 'point',
    scoringSide: 'us',
    scorerMembershipId: null,
    assistMembershipId: null,
  },
  baseStreamVersion: 14,
} as const;

function scope(onResult: (status: ScorekeeperActionStatus) => void) {
  return {
    ownerUserId: 'user-1',
    teamId: 'team-natives',
    matchId: 'match-1',
    isOnline: true,
    onResult,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

/** Submit one point and hand back the spy the hook reported through. */
function submitPoint(): ReturnType<typeof vi.fn> {
  const onResult = vi.fn();
  actOnHook(
    () => useScorekeeperActionMutation(scope(onResult)),
    (api) => {
      api.submit(POINT);
    },
  );
  return onResult;
}

describe('useScorekeeperActionMutation', () => {
  // applied: the point is on the stream. replayed: the same operation arrived
  // twice and the score did NOT move. conflict: the same id carried a
  // different payload and needs a human decision.
  it.each(['applied', 'replayed', 'conflict'] as const)(
    'reports the authoritative %s outcome',
    async (status) => {
      vi.mocked(recordScorekeeperAction).mockResolvedValue({ status, operationId: 'op-1' });

      const onResult = submitPoint();

      await waitFor(() => {
        expect(onResult).toHaveBeenCalledWith(status);
      });
    },
  );

  it('fires a haptic on the tap, before the server has answered', async () => {
    vi.mocked(recordScorekeeperAction).mockResolvedValue({
      status: 'applied',
      operationId: 'op-1',
    });

    const onResult = submitPoint();

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith('applied');
    });
    expect(triggerHapticImpact).toHaveBeenCalledWith('medium');
  });

  it('reports a transport failure without swallowing it', async () => {
    vi.mocked(recordScorekeeperAction).mockRejectedValue(new Error('offline'));

    const onResult = submitPoint();

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith('failed');
    });
  });
});
