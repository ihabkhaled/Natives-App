import { SCOREKEEPER_QUEUE_LIMIT, SCOREKEEPER_QUEUE_STATE } from '../constants/matches.constants';
import type { ScorekeeperQueuedOperation } from '../types/matches.types';

/**
 * The operations the signed-in scorekeeper owns for this match.
 *
 * Ownership is filtered here, at the only read path into the queue, so an
 * account switch cannot show — or submit — another scorekeeper's unsent
 * points. Everything else in the module reads through this selector.
 */
export function selectOwnedMatchQueue(
  operations: readonly ScorekeeperQueuedOperation[],
  ownerUserId: string,
  teamId: string,
  matchId: string,
): readonly ScorekeeperQueuedOperation[] {
  if (ownerUserId === '') {
    return [];
  }
  return operations.filter(
    (operation) =>
      operation.ownerUserId === ownerUserId &&
      operation.teamId === teamId &&
      operation.matchId === matchId,
  );
}

/** True when the persisted queue holds work belonging to a different account. */
export function selectHasForeignQueue(
  operations: readonly ScorekeeperQueuedOperation[],
  ownerUserId: string,
): boolean {
  return operations.some((operation) => operation.ownerUserId !== ownerUserId);
}

/** Operations still eligible for an automatic replay attempt. */
export function selectReplayableOperations(
  operations: readonly ScorekeeperQueuedOperation[],
): readonly ScorekeeperQueuedOperation[] {
  return operations.filter(
    (operation) =>
      operation.state === SCOREKEEPER_QUEUE_STATE.Pending ||
      operation.state === SCOREKEEPER_QUEUE_STATE.Retrying,
  );
}

export function selectConflictOperations(
  operations: readonly ScorekeeperQueuedOperation[],
): readonly ScorekeeperQueuedOperation[] {
  return operations.filter((operation) => operation.state === SCOREKEEPER_QUEUE_STATE.Conflict);
}

/** The whole persisted queue is what fills up, not just this match's slice. */
export function selectIsQueueAtLimit(operations: readonly ScorekeeperQueuedOperation[]): boolean {
  return operations.length >= SCOREKEEPER_QUEUE_LIMIT;
}
