import { isHttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import {
  MATCH_OPERATION_OUTCOME,
  SCOREKEEPER_MAX_RETRIES,
  SCOREKEEPER_QUEUE_STATE,
} from '../constants/matches.constants';
import { requestScorekeeperOperation } from '../gateways/match-events.gateway';
import { mapMatchOperation } from '../mappers/match.mapper';
import { useScorekeeperQueueStore } from '../store/scorekeeper-queue.store';
import type {
  MatchOperationOutcome,
  ScorekeeperQueuedOperation,
  ScorekeeperReplayResult,
} from '../types/matches.types';

type ReplayOutcome = MatchOperationOutcome | 'failed';

function formatServerScore(ourScore: number, opponentScore: number): string {
  return `${String(ourScore)}-${String(opponentScore)}`;
}

function recordFailure(operation: ScorekeeperQueuedOperation): void {
  const nextRetry = operation.retryCount + 1;
  useScorekeeperQueueStore
    .getState()
    .setOperationState(
      operation.operationId,
      nextRetry >= SCOREKEEPER_MAX_RETRIES
        ? SCOREKEEPER_QUEUE_STATE.Failed
        : SCOREKEEPER_QUEUE_STATE.Pending,
      true,
    );
}

/**
 * Deliver one queued command.
 *
 * `applied` and `replayed` are BOTH success: the server has the operation id
 * exactly once either way, so the queued entry is dropped and the authoritative
 * score is whatever the response carries. `conflict` — the same id with a
 * different payload, or a stale expected stream version — is parked for a human
 * decision. Nothing is merged.
 */
async function replayOne(operation: ScorekeeperQueuedOperation): Promise<ReplayOutcome> {
  const store = useScorekeeperQueueStore.getState();
  store.setOperationState(operation.operationId, SCOREKEEPER_QUEUE_STATE.Retrying, false);
  try {
    const result = mapMatchOperation(await requestScorekeeperOperation(operation));
    if (result.outcome === MATCH_OPERATION_OUTCOME.Conflict) {
      useScorekeeperQueueStore
        .getState()
        .markConflict(
          operation.operationId,
          formatServerScore(result.ourScore, result.opponentScore),
        );
      return MATCH_OPERATION_OUTCOME.Conflict;
    }
    useScorekeeperQueueStore.getState().remove(operation.operationId);
    return result.outcome;
  } catch (error) {
    const appError = isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
    if (appError.code === APP_ERROR_CODE.Conflict) {
      useScorekeeperQueueStore.getState().markConflict(operation.operationId, '');
      return MATCH_OPERATION_OUTCOME.Conflict;
    }
    recordFailure(operation);
    return 'failed';
  }
}

/**
 * Use case: drain the queue in the order the field recorded it. Order matters:
 * the stream is append-only and every command carries the version it was taken
 * from, so replaying out of order would be rejected rather than reordered.
 */
export async function replayScorekeeperQueue(
  operations: readonly ScorekeeperQueuedOperation[],
): Promise<ScorekeeperReplayResult> {
  const outcomes: { operationId: string; outcome: ReplayOutcome }[] = [];
  for (const operation of operations) {
    outcomes.push({ operationId: operation.operationId, outcome: await replayOne(operation) });
  }
  const idsFor = (wanted: ReplayOutcome): readonly string[] =>
    outcomes.filter((entry) => entry.outcome === wanted).map((entry) => entry.operationId);
  return {
    appliedOperationIds: idsFor(MATCH_OPERATION_OUTCOME.Applied),
    replayedOperationIds: idsFor(MATCH_OPERATION_OUTCOME.Replayed),
    conflictOperationIds: idsFor(MATCH_OPERATION_OUTCOME.Conflict),
    failedOperationIds: idsFor('failed'),
  };
}
