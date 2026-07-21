import { SCOREKEEPER_OPERATION_KIND } from '../constants/matches.constants';
import type { ScorekeeperPayload, ScorekeeperQueuedOperation } from '../types/matches.types';

/**
 * A stable, order-independent fingerprint of a command payload.
 *
 * The backend keys idempotency on the operation id alone: the same id with the
 * same payload replays (one score change), the same id with a *different*
 * payload is a 409 conflict. Recording the fingerprint next to the id lets the
 * client recognize that divergence locally, present it as a real conflict, and
 * never merge two different scores behind the operator's back.
 */
export function fingerprintScorekeeperPayload(payload: ScorekeeperPayload): string {
  if (payload.kind === SCOREKEEPER_OPERATION_KIND.Point) {
    return [
      payload.kind,
      payload.scoringSide,
      payload.scorerMembershipId ?? '-',
      payload.assistMembershipId ?? '-',
    ].join('|');
  }
  if (payload.kind === SCOREKEEPER_OPERATION_KIND.Timeout) {
    return [payload.kind, payload.scoringSide].join('|');
  }
  return [payload.kind, payload.eventId, payload.reason].join('|');
}

/** The label a conflict row shows for the value this client queued. */
export function describeScorekeeperPayload(payload: ScorekeeperPayload): string {
  if (payload.kind === SCOREKEEPER_OPERATION_KIND.Void) {
    return payload.eventId;
  }
  return payload.scoringSide;
}

interface ScorekeeperRequestBody {
  readonly operationId: string;
  readonly expectedStreamVersion?: number;
  readonly scoringSide?: string;
  readonly scorerMembershipId?: string | null;
  readonly assistMembershipId?: string | null;
  readonly eventId?: string;
  readonly reason?: string;
}

/**
 * The wire body for one queued command. `expectedStreamVersion` is the version
 * the operator saw when they tapped, so a queue replayed against a stream that
 * has moved on is rejected by the server rather than silently reordered.
 */
export function buildScorekeeperRequestBody(
  operation: ScorekeeperQueuedOperation,
): ScorekeeperRequestBody {
  const payload = operation.payload;
  if (payload.kind === SCOREKEEPER_OPERATION_KIND.Point) {
    return {
      operationId: operation.operationId,
      expectedStreamVersion: operation.baseStreamVersion,
      scoringSide: payload.scoringSide,
      scorerMembershipId: payload.scorerMembershipId,
      assistMembershipId: payload.assistMembershipId,
    };
  }
  if (payload.kind === SCOREKEEPER_OPERATION_KIND.Timeout) {
    return { operationId: operation.operationId, scoringSide: payload.scoringSide };
  }
  return {
    operationId: operation.operationId,
    eventId: payload.eventId,
    reason: payload.reason,
  };
}
