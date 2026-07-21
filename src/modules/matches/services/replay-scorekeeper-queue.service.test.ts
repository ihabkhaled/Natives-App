import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '@/packages/http';
import { buildQueuedOperation } from '@/tests/msw/matches-domain.fixture';

import { SCOREKEEPER_MAX_RETRIES } from '../constants/matches.constants';
import { useScorekeeperQueueStore } from '../store/scorekeeper-queue.store';
import { replayScorekeeperQueue } from './replay-scorekeeper-queue.service';

const { requestScorekeeperOperation } = vi.hoisted(() => ({
  requestScorekeeperOperation: vi.fn(),
}));

vi.mock('../gateways/match-events.gateway', () => ({ requestScorekeeperOperation }));

function envelope(outcome: string, ourScore: number, opponentScore: number, version: number) {
  return {
    outcome,
    streamVersion: version,
    ourScore,
    opponentScore,
    event: {
      eventId: 'event-1',
      matchId: 'match-1',
      sequence: version,
      operationId: 'operation-abcdefgh',
      eventType: 'point',
      scoringSide: 'us',
      points: 1,
      ourScoreAfter: ourScore,
      opponentScoreAfter: opponentScore,
      period: 1,
      scorerMembershipId: null,
      assistMembershipId: null,
      voidsEventId: null,
      voided: false,
      voidReason: null,
      occurredAt: null,
      recordedAt: '2026-07-18T15:30:00.000Z',
    },
  };
}

beforeEach(() => {
  requestScorekeeperOperation.mockReset();
  useScorekeeperQueueStore.getState().clear();
});

afterEach(() => {
  useScorekeeperQueueStore.getState().clear();
});

describe('replayScorekeeperQueue', () => {
  it('drops an applied operation and reports it as applied', async () => {
    const operation = buildQueuedOperation();
    useScorekeeperQueueStore.getState().enqueue(operation);
    requestScorekeeperOperation.mockResolvedValue(envelope('applied', 9, 6, 15));

    const result = await replayScorekeeperQueue([operation]);

    expect(result.appliedOperationIds).toStrictEqual([operation.operationId]);
    expect(useScorekeeperQueueStore.getState().operations).toStrictEqual([]);
  });

  it('treats a replay as success, so a retried operation never scores twice', async () => {
    const operation = buildQueuedOperation();
    useScorekeeperQueueStore.getState().enqueue(operation);
    // The server recognised the same operation id and did NOT move the score:
    // it answers with the authoritative 9-6 it already holds.
    requestScorekeeperOperation.mockResolvedValue(envelope('replayed', 9, 6, 15));

    const result = await replayScorekeeperQueue([operation]);

    expect(result.replayedOperationIds).toStrictEqual([operation.operationId]);
    expect(result.appliedOperationIds).toStrictEqual([]);
    expect(useScorekeeperQueueStore.getState().operations).toStrictEqual([]);
  });

  it('parks a conflict envelope with the server score and never merges', async () => {
    const operation = buildQueuedOperation();
    useScorekeeperQueueStore.getState().enqueue(operation);
    requestScorekeeperOperation.mockResolvedValue(envelope('conflict', 9, 7, 16));

    const result = await replayScorekeeperQueue([operation]);

    expect(result.conflictOperationIds).toStrictEqual([operation.operationId]);
    const parked = useScorekeeperQueueStore.getState().operations[0];
    expect(parked?.state).toBe('conflict');
    expect(parked?.conflictServerScore).toBe('9-7');
  });

  it('parks a 409 as a conflict rather than retrying it into a second score', async () => {
    const operation = buildQueuedOperation();
    useScorekeeperQueueStore.getState().enqueue(operation);
    requestScorekeeperOperation.mockRejectedValue(
      new HttpError({ kind: 'conflict', status: 409, message: 'conflict' }),
    );

    const result = await replayScorekeeperQueue([operation]);

    expect(result.conflictOperationIds).toStrictEqual([operation.operationId]);
    expect(useScorekeeperQueueStore.getState().operations[0]?.state).toBe('conflict');
  });

  it('keeps a transport failure queued as pending for another attempt', async () => {
    const operation = buildQueuedOperation();
    useScorekeeperQueueStore.getState().enqueue(operation);
    requestScorekeeperOperation.mockRejectedValue(new Error('offline'));

    const result = await replayScorekeeperQueue([operation]);

    expect(result.failedOperationIds).toStrictEqual([operation.operationId]);
    const parked = useScorekeeperQueueStore.getState().operations[0];
    expect(parked?.state).toBe('pending');
    expect(parked?.retryCount).toBe(1);
  });

  it('parks an operation as failed once the retry budget is spent', async () => {
    const operation = buildQueuedOperation({ retryCount: SCOREKEEPER_MAX_RETRIES - 1 });
    useScorekeeperQueueStore.getState().enqueue(operation);
    requestScorekeeperOperation.mockRejectedValue(new Error('offline'));

    await replayScorekeeperQueue([operation]);

    expect(useScorekeeperQueueStore.getState().operations[0]?.state).toBe('failed');
  });

  it('delivers the queue in the order it was recorded', async () => {
    const first = buildQueuedOperation({ operationId: 'op-first-001' });
    const second = buildQueuedOperation({ operationId: 'op-second-01' });
    requestScorekeeperOperation.mockResolvedValue(envelope('applied', 9, 6, 15));

    await replayScorekeeperQueue([first, second]);

    expect(
      requestScorekeeperOperation.mock.calls.map(
        (call) => (call[0] as { operationId: string }).operationId,
      ),
    ).toStrictEqual(['op-first-001', 'op-second-01']);
  });
});
