import { matchRecord } from './matches.fixture';
import type { EventDto } from './matches.fixture';

export interface ScorekeeperCommandBody {
  readonly operationId?: string;
  readonly expectedStreamVersion?: number | null;
  readonly scoringSide?: 'us' | 'them';
  readonly scorerMembershipId?: string | null;
  readonly assistMembershipId?: string | null;
  readonly eventId?: string;
  readonly reason?: string;
}

interface OperationEnvelope {
  readonly outcome: 'applied' | 'replayed' | 'conflict';
  readonly event: EventDto;
  readonly streamVersion: number;
  readonly ourScore: number;
  readonly opponentScore: number;
}

export type OperationResult =
  | { readonly kind: 'ok'; readonly body: OperationEnvelope }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'invalid' }
  | { readonly kind: 'conflict' };

/**
 * The server-side fingerprint. Two submissions of the same operation id are a
 * replay only when the payload is byte-for-byte the same decision.
 */
function fingerprint(kind: string, body: ScorekeeperCommandBody): string {
  return [
    kind,
    body.scoringSide ?? '-',
    body.scorerMembershipId ?? '-',
    body.assistMembershipId ?? '-',
    body.eventId ?? '-',
    body.reason ?? '-',
  ].join('|');
}

function envelope(matchId: string, outcome: OperationEnvelope['outcome']): OperationResult {
  const record = matchRecord(matchId);
  if (record === null) {
    return { kind: 'not-found' };
  }
  const event = record.events.at(-1);
  if (event === undefined) {
    return { kind: 'not-found' };
  }
  return {
    kind: 'ok',
    body: {
      outcome,
      event,
      streamVersion: record.match.streamVersion,
      ourScore: record.match.ourScore,
      opponentScore: record.match.opponentScore,
    },
  };
}

function scoreDelta(
  eventType: EventDto['eventType'],
  body: ScorekeeperCommandBody,
): { us: number; them: number } {
  if (eventType !== 'point') {
    return { us: 0, them: 0 };
  }
  return body.scoringSide === 'us' ? { us: 1, them: 0 } : { us: 0, them: 1 };
}

/** Only a correction carries the event it compensates and the written reason. */
function voidCorrectionFields(
  eventType: EventDto['eventType'],
  body: ScorekeeperCommandBody,
): { voidsEventId: string | null; voidReason: string | null } {
  if (eventType !== 'void') {
    return { voidsEventId: null, voidReason: null };
  }
  return { voidsEventId: body.eventId ?? null, voidReason: body.reason ?? null };
}

function appendEvent(
  matchId: string,
  eventType: EventDto['eventType'],
  body: ScorekeeperCommandBody,
): void {
  const record = matchRecord(matchId);
  if (record === null) {
    return;
  }
  const next = record.match.streamVersion + 1;
  const delta = scoreDelta(eventType, body);
  const voidFields = voidCorrectionFields(eventType, body);
  record.match = {
    ...record.match,
    streamVersion: next,
    ourScore: record.match.ourScore + delta.us,
    opponentScore: record.match.opponentScore + delta.them,
  };
  record.events.push({
    ...voidFields,
    eventId: `${matchId}-event-${String(next)}`,
    matchId,
    sequence: next,
    operationId: body.operationId ?? '',
    eventType,
    scoringSide: body.scoringSide ?? null,
    points: eventType === 'point' ? 1 : null,
    ourScoreAfter: record.match.ourScore,
    opponentScoreAfter: record.match.opponentScore,
    period: record.match.period,
    scorerMembershipId: body.scorerMembershipId ?? null,
    assistMembershipId: body.assistMembershipId ?? null,
    voided: false,
    occurredAt: null,
    recordedAt: '2026-07-18T15:30:00.000Z',
  });
}

/** An omitted expected version opts out of the check; a wrong one is stale. */
function isStaleVersion(expected: number | null | undefined, current: number): boolean {
  return expected !== undefined && expected !== null && expected !== current;
}

/**
 * The idempotency contract, mirrored exactly.
 *
 * - Unknown operation id at the current stream version -> `applied`, one score
 *   change.
 * - Known operation id with the SAME payload -> `replayed`, the score does not
 *   move again, and the authoritative envelope is returned unchanged.
 * - Known operation id with a DIFFERENT payload -> 409. Nothing is merged.
 * - A stale `expectedStreamVersion` -> 409, so a queue built against an older
 *   stream is rejected rather than applied out of order.
 */
export function applyScorekeeperCommand(
  matchId: string,
  kind: 'point' | 'timeout' | 'void',
  body: ScorekeeperCommandBody,
): OperationResult {
  const record = matchRecord(matchId);
  if (record === null) {
    return { kind: 'not-found' };
  }
  const operationId = body.operationId ?? '';
  if (operationId === '') {
    return { kind: 'invalid' };
  }
  const stamp = fingerprint(kind, body);
  const seen = record.operations.get(operationId);
  if (seen !== undefined) {
    return seen === stamp ? envelope(matchId, 'replayed') : { kind: 'conflict' };
  }
  if (isStaleVersion(body.expectedStreamVersion, record.match.streamVersion)) {
    return { kind: 'conflict' };
  }
  record.operations.set(operationId, stamp);
  appendEvent(matchId, kind, body);
  return envelope(matchId, 'applied');
}
