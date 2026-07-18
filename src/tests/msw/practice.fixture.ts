import type {
  PracticeRsvpContract,
  PracticeSessionContract,
  PracticeSessionListContract,
  SetRsvpRequestContract,
} from '@/packages/api-contract';

import {
  buildInitialPracticeRecords,
  CONFLICT_SESSION_ID,
  type PracticeMockRecord,
} from './practice-session-data.fixture';

let records: PracticeMockRecord[] = buildInitialPracticeRecords();

export function resetMockPracticeState(): void {
  records = buildInitialPracticeRecords();
}

export interface PracticeListQuery {
  readonly from: string | null;
  readonly to: string | null;
  readonly sessionType: string | null;
  readonly status: PracticeSessionContract['status'] | null;
  readonly limit: number;
  readonly offset: number;
}

function matchesQuery(session: PracticeSessionContract, query: PracticeListQuery): boolean {
  const startsAt = new Date(session.startsAt).getTime();
  const afterFrom = query.from === null || startsAt >= new Date(query.from).getTime();
  const beforeTo = query.to === null || startsAt <= new Date(query.to).getTime();
  const typeMatches = query.sessionType === null || session.sessionType === query.sessionType;
  const statusMatches = query.status === null || session.status === query.status;
  return afterFrom && beforeTo && typeMatches && statusMatches;
}

/** Filtered, ordered, offset-based response matching ListSessionsResponseDto. */
export function buildPracticeListResponse(
  teamId: string,
  query: PracticeListQuery,
): PracticeSessionListContract {
  const filtered = records
    .map((record) => record.session)
    .filter((session) => session.teamId === teamId)
    .filter((session) => matchesQuery(session, query))
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  return {
    items: filtered.slice(query.offset, query.offset + query.limit),
    limit: query.limit,
    offset: query.offset,
    total: filtered.length,
  };
}

export function findPracticeSession(
  teamId: string,
  sessionId: string,
): PracticeSessionContract | undefined {
  return records.find(
    (record) => record.session.teamId === teamId && record.session.id === sessionId,
  )?.session;
}

export function findPracticeRsvp(
  teamId: string,
  sessionId: string,
): PracticeRsvpContract | undefined {
  return records.find(
    (record) => record.session.teamId === teamId && record.session.id === sessionId,
  )?.rsvp;
}

export type RsvpApplyResult =
  | { readonly kind: 'ok'; readonly rsvp: PracticeRsvpContract }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'conflict' }
  | { readonly kind: 'deadline' };

function isDeadlinePassed(record: PracticeMockRecord): boolean {
  const cutoff = record.session.rsvpCutoffAt;
  return cutoff !== null && new Date(cutoff).getTime() < Date.now();
}

function hasVersionConflict(
  sessionId: string,
  expectedVersion: number | undefined,
  actualVersion: number | null,
): boolean {
  return (
    sessionId === CONFLICT_SESSION_ID ||
    (expectedVersion !== undefined && expectedVersion !== actualVersion)
  );
}

function buildUpdatedRsvp(
  current: PracticeRsvpContract,
  body: SetRsvpRequestContract,
): PracticeRsvpContract {
  return {
    ...current,
    status: body.status,
    reasonCategory: body.reasonCategory ?? null,
    note: body.note ?? null,
    noteVisibility: body.noteVisibility ?? null,
    respondedAt: new Date().toISOString(),
    source: 'self',
    version: (current.version ?? 0) + 1,
  };
}

/** Apply SetRsvpDto with the backend's deadline and expected-version policy. */
export function applyRsvp(
  teamId: string,
  sessionId: string,
  body: SetRsvpRequestContract,
): RsvpApplyResult {
  const index = records.findIndex(
    (record) => record.session.teamId === teamId && record.session.id === sessionId,
  );
  const record = records[index];
  if (record === undefined) {
    return { kind: 'not-found' };
  }
  if (hasVersionConflict(sessionId, body.expectedVersion, record.rsvp.version)) {
    return { kind: 'conflict' };
  }
  if (isDeadlinePassed(record)) {
    return { kind: 'deadline' };
  }
  const rsvp = buildUpdatedRsvp(record.rsvp, body);
  records[index] = { ...record, rsvp };
  return { kind: 'ok', rsvp };
}
