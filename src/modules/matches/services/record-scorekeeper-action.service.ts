import { MATCH_OPERATION_OUTCOME } from '../constants/matches.constants';
import {
  selectOwnedMatchQueue,
  selectReplayableOperations,
} from '../store/scorekeeper-queue.selectors';
import { useScorekeeperQueueStore } from '../store/scorekeeper-queue.store';
import { queueScorekeeperOperation } from './queue-scorekeeper-operation.service';
import { replayScorekeeperQueue } from './replay-scorekeeper-queue.service';
import type { QueueScorekeeperCommand } from './queue-scorekeeper-operation.service';
import type { ScorekeeperActionResult, ScorekeeperActionStatus } from '../types/matches.types';

function statusForOperation(
  operationId: string,
  applied: readonly string[],
  replayed: readonly string[],
  conflicts: readonly string[],
): ScorekeeperActionStatus {
  if (applied.includes(operationId)) {
    return MATCH_OPERATION_OUTCOME.Applied;
  }
  if (replayed.includes(operationId)) {
    return MATCH_OPERATION_OUTCOME.Replayed;
  }
  return conflicts.includes(operationId) ? MATCH_OPERATION_OUTCOME.Conflict : 'failed';
}

/**
 * Use case: record one scorekeeper action.
 *
 * Every action — online or off — is queued first, so the operation id and the
 * base stream version are captured before anything can be lost. Online, the
 * whole owned queue is then drained in order, which keeps a late-arriving
 * offline backlog ahead of the tap that just happened.
 */
export async function recordScorekeeperAction(
  command: QueueScorekeeperCommand,
  isOnline: boolean,
): Promise<ScorekeeperActionResult> {
  const queued = queueScorekeeperOperation(command);
  if (queued.outcome === 'at-limit') {
    return { status: 'blocked-at-limit', operationId: queued.operation.operationId };
  }
  if (!isOnline) {
    return { status: 'queued', operationId: queued.operation.operationId };
  }
  const owned = selectOwnedMatchQueue(
    useScorekeeperQueueStore.getState().operations,
    command.ownerUserId,
    command.teamId,
    command.matchId,
  );
  const result = await replayScorekeeperQueue(selectReplayableOperations(owned));
  return {
    status: statusForOperation(
      queued.operation.operationId,
      result.appliedOperationIds,
      result.replayedOperationIds,
      result.conflictOperationIds,
    ),
    operationId: queued.operation.operationId,
  };
}
