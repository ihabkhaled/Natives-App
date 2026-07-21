import { nowIso } from '@/packages/date';
import { createCorrelationId } from '@/packages/http';

import { SCOREKEEPER_QUEUE_STATE } from '../constants/matches.constants';
import { fingerprintScorekeeperPayload } from '../helpers/scorekeeper-payload.helper';
import { useScorekeeperQueueStore } from '../store/scorekeeper-queue.store';
import type {
  ScorekeeperEnqueueOutcome,
  ScorekeeperPayload,
  ScorekeeperQueuedOperation,
} from '../types/matches.types';

export interface QueueScorekeeperCommand {
  readonly ownerUserId: string;
  readonly teamId: string;
  readonly matchId: string;
  readonly baseStreamVersion: number;
  readonly payload: ScorekeeperPayload;
}

export interface QueueScorekeeperResult {
  readonly outcome: ScorekeeperEnqueueOutcome;
  readonly operation: ScorekeeperQueuedOperation;
}

/**
 * Use case: park one scorekeeper command for later delivery.
 *
 * The operation id is minted exactly once, here, and travels with the command
 * for the rest of its life. Every later delivery attempt reuses it, which is
 * what makes a retry a server-side replay instead of a second point.
 */
export function queueScorekeeperOperation(
  command: QueueScorekeeperCommand,
): QueueScorekeeperResult {
  const operation: ScorekeeperQueuedOperation = {
    operationId: createCorrelationId(),
    ownerUserId: command.ownerUserId,
    teamId: command.teamId,
    matchId: command.matchId,
    kind: command.payload.kind,
    payload: command.payload,
    payloadFingerprint: fingerprintScorekeeperPayload(command.payload),
    baseStreamVersion: command.baseStreamVersion,
    state: SCOREKEEPER_QUEUE_STATE.Pending,
    retryCount: 0,
    conflictServerScore: null,
    createdAtIso: nowIso(),
  };
  const outcome = useScorekeeperQueueStore.getState().enqueue(operation);
  return { outcome, operation };
}
