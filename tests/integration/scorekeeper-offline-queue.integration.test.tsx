import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SCOREKEEPER_QUEUE_LIMIT } from '@/modules/matches';
import { queueScorekeeperOperation } from '@/modules/matches/services/queue-scorekeeper-operation.service';
import { recordScorekeeperAction } from '@/modules/matches/services/record-scorekeeper-action.service';
import { replayScorekeeperQueue } from '@/modules/matches/services/replay-scorekeeper-queue.service';
import {
  selectOwnedMatchQueue,
  selectReplayableOperations,
} from '@/modules/matches/store/scorekeeper-queue.selectors';
import { useScorekeeperQueueStore } from '@/modules/matches/store/scorekeeper-queue.store';
import { getMatchScoreboard } from '@/modules/matches/services/get-match-scoreboard.service';
import { MOCK_MATCHES } from '@/tests/msw/matches-ids.fixture';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';

const SCOREKEEPER = 'user-coach';
const OTHER_SCOREKEEPER = 'user-admin';

function pointPayload(scorerMembershipId: string | null = null) {
  return {
    kind: 'point',
    scoringSide: 'us',
    scorerMembershipId,
    assistMembershipId: null,
  } as const;
}

function command(baseStreamVersion: number, scorer: string | null = null) {
  return {
    ownerUserId: SCOREKEEPER,
    teamId: MOCK_MATCHES.teamId,
    matchId: MOCK_MATCHES.liveMatchId,
    baseStreamVersion,
    payload: pointPayload(scorer),
  };
}

function ownedQueue(ownerUserId = SCOREKEEPER) {
  return selectOwnedMatchQueue(
    useScorekeeperQueueStore.getState().operations,
    ownerUserId,
    MOCK_MATCHES.teamId,
    MOCK_MATCHES.liveMatchId,
  );
}

function scoreboard() {
  return getMatchScoreboard(MOCK_MATCHES.teamId, MOCK_MATCHES.liveMatchId);
}

beforeEach(async () => {
  await resetSessionForTest();
  useScorekeeperQueueStore.getState().clear();
  await signInAs(MOCK_PERSONA_EMAILS.coach);
});

afterEach(async () => {
  await clearSessionAfterTest();
  useScorekeeperQueueStore.getState().clear();
});

describe('offline scorekeeper queue (real client + MSW)', () => {
  it('queues offline and replays on reconnect, moving the score exactly once', async () => {
    const offline = await recordScorekeeperAction(command(14), false);

    expect(offline.status).toBe('queued');
    expect(ownedQueue()).toHaveLength(1);
    expect((await scoreboard()).ourScore).toBe(8);

    await replayScorekeeperQueue(selectReplayableOperations(ownedQueue()));

    expect((await scoreboard()).ourScore).toBe(9);
    expect(ownedQueue()).toStrictEqual([]);
  });

  it('yields the SAME authoritative outcome when the same operation is retried', async () => {
    const queued = queueScorekeeperOperation(command(14));

    const first = await replayScorekeeperQueue([queued.operation]);
    const afterFirst = await scoreboard();
    const second = await replayScorekeeperQueue([queued.operation]);
    const afterSecond = await scoreboard();

    expect(first.appliedOperationIds).toStrictEqual([queued.operation.operationId]);
    expect(second.replayedOperationIds).toStrictEqual([queued.operation.operationId]);
    // One score change, not two: the retry replayed rather than scored again.
    expect(afterFirst.ourScore).toBe(9);
    expect(afterSecond.ourScore).toBe(9);
  });

  it('surfaces the same operation id with a CHANGED payload as a real conflict', async () => {
    const queued = queueScorekeeperOperation(command(14));
    await replayScorekeeperQueue([queued.operation]);

    // Same id, different decision: who scored it changed.
    const diverged = {
      ...queued.operation,
      payload: pointPayload('mem-omar'),
      payloadFingerprint: 'point|us|mem-omar|-',
      state: 'pending' as const,
    };
    useScorekeeperQueueStore.getState().enqueue(diverged);
    const result = await replayScorekeeperQueue([diverged]);

    expect(result.conflictOperationIds).toStrictEqual([diverged.operationId]);
    expect(ownedQueue()[0]?.state).toBe('conflict');
    // Nothing was merged: the server score is still the one it applied first.
    expect((await scoreboard()).ourScore).toBe(9);
  });

  it('rejects a queue built against a stale stream version instead of reordering it', async () => {
    const stale = queueScorekeeperOperation(command(2));

    const result = await replayScorekeeperQueue([stale.operation]);

    expect(result.conflictOperationIds).toStrictEqual([stale.operation.operationId]);
    expect((await scoreboard()).ourScore).toBe(8);
  });

  it('preserves the queue across an app restart', async () => {
    await recordScorekeeperAction(command(14), false);
    const before = ownedQueue().map((operation) => operation.operationId);

    // Rehydrating the persisted payload is what a cold start does.
    const { migratePersistedScorekeeperQueue } =
      await import('@/modules/matches/store/scorekeeper-queue.migrations');
    const restored = migratePersistedScorekeeperQueue(
      { operations: useScorekeeperQueueStore.getState().operations },
      1,
    );

    expect(restored.operations.map((operation) => operation.operationId)).toStrictEqual(before);
  });

  it('prevents another account from reading or submitting the queue', async () => {
    await recordScorekeeperAction(command(14), false);

    // The queue is still on the device, but scoped to the account that made it.
    expect(useScorekeeperQueueStore.getState().operations).toHaveLength(1);
    expect(ownedQueue(OTHER_SCOREKEEPER)).toStrictEqual([]);

    // Replay only ever runs over the owned slice, so the other account submits
    // nothing and the score does not move.
    await replayScorekeeperQueue(selectReplayableOperations(ownedQueue(OTHER_SCOREKEEPER)));

    expect((await scoreboard()).ourScore).toBe(8);
  });

  it('BLOCKS further scoring at the queue limit instead of dropping the oldest point', async () => {
    for (let index = 0; index < SCOREKEEPER_QUEUE_LIMIT; index += 1) {
      await recordScorekeeperAction(command(14), false);
    }
    const oldest = ownedQueue()[0]?.operationId;

    const blocked = await recordScorekeeperAction(command(14), false);

    expect(blocked.status).toBe('blocked-at-limit');
    expect(useScorekeeperQueueStore.getState().operations).toHaveLength(SCOREKEEPER_QUEUE_LIMIT);
    expect(ownedQueue()[0]?.operationId).toBe(oldest);
    expect(ownedQueue().some((operation) => operation.operationId === blocked.operationId)).toBe(
      false,
    );
  });

  it('reports an online tap as applied and drains the queue in recorded order', async () => {
    const backlog = queueScorekeeperOperation(command(14));

    const online = await recordScorekeeperAction(command(15, 'mem-nadia'), true);

    expect(online.status).toBe('applied');
    expect(ownedQueue()).toStrictEqual([]);
    expect((await scoreboard()).ourScore).toBe(10);
    expect(backlog.operation.operationId).not.toBe(online.operationId);
  });
});
