import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SCOREKEEPER_QUEUE_LIMIT } from '../constants/matches.constants';
import { replayScorekeeperQueue } from './replay-scorekeeper-queue.service';
import { useScorekeeperQueueStore } from '../store/scorekeeper-queue.store';
import { recordScorekeeperAction } from './record-scorekeeper-action.service';
import { buildQueuedOperation } from '@/tests/msw/matches-domain.fixture';

vi.mock('./replay-scorekeeper-queue.service', () => ({ replayScorekeeperQueue: vi.fn() }));

const EMPTY_REPLAY = {
  appliedOperationIds: [],
  replayedOperationIds: [],
  conflictOperationIds: [],
  failedOperationIds: [],
};

const COMMAND = {
  ownerUserId: 'user-1',
  teamId: 'team-natives',
  matchId: 'match-1',
  baseStreamVersion: 14,
  payload: {
    kind: 'point',
    scoringSide: 'us',
    scorerMembershipId: null,
    assistMembershipId: null,
  },
} as const;

function resolveReplayWith(bucket: keyof typeof EMPTY_REPLAY): void {
  vi.mocked(replayScorekeeperQueue).mockImplementation((operations) =>
    Promise.resolve({
      ...EMPTY_REPLAY,
      [bucket]: operations.map((operation) => operation.operationId),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useScorekeeperQueueStore.getState().clear();
  vi.mocked(replayScorekeeperQueue).mockResolvedValue(EMPTY_REPLAY);
});

afterEach(() => {
  useScorekeeperQueueStore.getState().clear();
});

describe('recordScorekeeperAction', () => {
  it('queues without delivering while offline', async () => {
    const result = await recordScorekeeperAction(COMMAND, false);

    expect(result.status).toBe('queued');
    expect(replayScorekeeperQueue).not.toHaveBeenCalled();
    expect(useScorekeeperQueueStore.getState().operations).toHaveLength(1);
  });

  it('reports an applied delivery', async () => {
    resolveReplayWith('appliedOperationIds');

    expect((await recordScorekeeperAction(COMMAND, true)).status).toBe('applied');
  });

  it('reports a replay, which did not move the score', async () => {
    resolveReplayWith('replayedOperationIds');

    expect((await recordScorekeeperAction(COMMAND, true)).status).toBe('replayed');
  });

  it('reports a conflict that needs a decision', async () => {
    resolveReplayWith('conflictOperationIds');

    expect((await recordScorekeeperAction(COMMAND, true)).status).toBe('conflict');
  });

  it('reports a delivery that did not land in any bucket as failed', async () => {
    expect((await recordScorekeeperAction(COMMAND, true)).status).toBe('failed');
  });

  it('BLOCKS at the queue limit and never delivers the refused action', async () => {
    for (let index = 0; index < SCOREKEEPER_QUEUE_LIMIT; index += 1) {
      useScorekeeperQueueStore
        .getState()
        .enqueue(buildQueuedOperation({ operationId: `op-${String(index).padStart(8, '0')}` }));
    }

    const result = await recordScorekeeperAction(COMMAND, true);

    expect(result.status).toBe('blocked-at-limit');
    expect(replayScorekeeperQueue).not.toHaveBeenCalled();
    expect(useScorekeeperQueueStore.getState().operations).toHaveLength(SCOREKEEPER_QUEUE_LIMIT);
  });

  it('drains the whole owned backlog in order, not just the newest tap', async () => {
    useScorekeeperQueueStore
      .getState()
      .enqueue(buildQueuedOperation({ operationId: 'op-backlog01' }));
    resolveReplayWith('appliedOperationIds');

    await recordScorekeeperAction(COMMAND, true);

    const delivered = vi.mocked(replayScorekeeperQueue).mock.calls[0]?.[0] ?? [];
    expect(delivered).toHaveLength(2);
    expect(delivered[0]?.operationId).toBe('op-backlog01');
  });
});
