import type {
  attendanceRecordResponseSchema,
  attendanceSelfHistoryResponseSchema,
  attendanceSelfRecordSchema,
} from '@/modules/attendance';
import type { BackendApiSchemas } from '@/packages/api-contract';
import type { SchemaOutput } from '@/packages/schema';

import { mockAttendanceSheetStateFor } from './attendance.fixture';
import { makeParticipationDto } from './attendance-wire.fixture';
import { MOCK_ATTENDANCE } from './mock-data.constants';
import { findPracticeSession } from './practice.fixture';

type AttendanceRecord = SchemaOutput<typeof attendanceRecordResponseSchema>;
type SelfRecord = SchemaOutput<typeof attendanceSelfRecordSchema>;
type SelfCheckInBlock = NonNullable<SelfRecord['selfCheckIn']>;
type SelfHistory = SchemaOutput<typeof attendanceSelfHistoryResponseSchema>;
type SelfHistoryEntry = SelfHistory['items'][number];
type PracticeSession = NonNullable<ReturnType<typeof findPracticeSession>>;

/** The caller's own membership scope, mirroring `buildAuthMembership`. */
const SELF_MEMBERSHIP_ID = 'membership-natives-1';
const MINUTE_MS = 60_000;
const CHECK_IN_OPENS_BEFORE_START_MS = 60 * MINUTE_MS;
const CHECK_IN_ABLE_STATUSES: readonly string[] = ['published', 'rescheduled'];

function emptySelfRecord(sessionId: string): AttendanceRecord {
  return {
    sessionId,
    membershipId: SELF_MEMBERSHIP_ID,
    status: null,
    checkInAt: null,
    checkOutAt: null,
    latenessMinutes: null,
    excuseCategory: null,
    source: null,
    recordedAt: null,
    version: null,
  };
}

let selfRecord: AttendanceRecord | null = null;

export function resetMockAttendanceSelfState(): void {
  selfRecord = null;
}

function ownRecordFor(sessionId: string): AttendanceRecord | null {
  return selfRecord !== null && selfRecord.sessionId === sessionId ? selfRecord : null;
}

function checkInOpensAtMs(session: PracticeSession): number {
  return Date.parse(session.startsAt) - CHECK_IN_OPENS_BEFORE_START_MS;
}

/** Pure UTC window mirror of the backend `resolveCheckInWindow` policy. */
function isWithinWindow(session: PracticeSession): boolean {
  return (
    CHECK_IN_ABLE_STATUSES.includes(session.status) &&
    Date.now() >= checkInOpensAtMs(session) &&
    Date.now() <= Date.parse(session.endsAt)
  );
}

/**
 * Mirror of the backend `deriveSelfCheckInEligibility` policy: `recorded`
 * beats `locked` beats the pure UTC window.
 */
function resolveEligibility(session: PracticeSession, hasRecord: boolean): SelfCheckInBlock {
  const windowState = isWithinWindow(session)
    ? 'open'
    : Date.now() < checkInOpensAtMs(session) && CHECK_IN_ABLE_STATUSES.includes(session.status)
      ? 'not_open'
      : 'closed';
  const state = hasRecord
    ? 'recorded'
    : mockAttendanceSheetStateFor(session.id) !== 'open'
      ? 'locked'
      : windowState;
  return {
    state,
    opensAt: new Date(checkInOpensAtMs(session)).toISOString(),
    closesAt: new Date(Date.parse(session.endsAt)).toISOString(),
  };
}

export type MySelfReadResult = { kind: 'ok'; record: SelfRecord } | { kind: 'not-found' };

/** Own per-session record; `status: null` mirrors the backend notRecordedView. */
export function buildMyAttendance(sessionId: string): MySelfReadResult {
  const session = findPracticeSession(MOCK_ATTENDANCE.teamId, sessionId);
  if (session === undefined) {
    return { kind: 'not-found' };
  }
  const record = ownRecordFor(sessionId);
  return {
    kind: 'ok',
    record: {
      ...(record ?? emptySelfRecord(sessionId)),
      selfCheckIn: resolveEligibility(session, record !== null),
    },
  };
}

export type SelfCheckInResult =
  | { kind: 'ok'; record: SelfRecord }
  | { kind: 'window' }
  | { kind: 'locked' }
  | { kind: 'not-found' };

/** Backend rule: on-time up to the start instant; late is ceil'd minutes ≥ 1. */
function deriveLatenessMinutes(session: PracticeSession): number | null {
  const diffMs = Date.now() - Date.parse(session.startsAt);
  return diffMs <= 0 ? null : Math.max(1, Math.ceil(diffMs / MINUTE_MS));
}

/**
 * Self check-in mirrors contract 1.6.0: the explicit server window (opens
 * `startsAt − 60m`, closes at session end, only published/rescheduled), the
 * finalized-sheet refusal, idempotent repeats (the existing record returns
 * unchanged — never overwritten), and a clock-derived on-time/late status.
 * Write responses carry `selfCheckIn: null` like the backend mapper.
 */
export function applySelfCheckIn(sessionId: string): SelfCheckInResult {
  const session = findPracticeSession(MOCK_ATTENDANCE.teamId, sessionId);
  if (session === undefined) {
    return { kind: 'not-found' };
  }
  const existing = ownRecordFor(sessionId);
  if (existing !== null) {
    return { kind: 'ok', record: { ...existing, selfCheckIn: null } };
  }
  // Backend ordering: the window rules before the sheet lock is consulted.
  if (!isWithinWindow(session)) {
    return { kind: 'window' };
  }
  if (mockAttendanceSheetStateFor(sessionId) !== 'open') {
    return { kind: 'locked' };
  }
  const nowIso = new Date().toISOString();
  const latenessMinutes = deriveLatenessMinutes(session);
  selfRecord = {
    ...emptySelfRecord(sessionId),
    status: latenessMinutes === null ? 'present_on_time' : 'present_late',
    checkInAt: nowIso,
    latenessMinutes,
    source: 'self',
    recordedAt: nowIso,
    version: 1,
  };
  return { kind: 'ok', record: { ...selfRecord, selfCheckIn: null } };
}

const SELF_HISTORY_TOTAL = 25;
const DAY_MS = 24 * 60 * MINUTE_MS;
const SELF_HISTORY_STATUS_CYCLE: readonly (SelfHistoryEntry['status'] | null)[] = [
  'present_on_time',
  'present_late',
  null,
  'excused',
  'absent',
];

function historyEntrySource(status: SelfHistoryEntry['status']): SelfHistoryEntry['source'] {
  if (status === null) {
    return null;
  }
  return status === 'present_on_time' ? 'self' : 'coach';
}

/** One deterministic past session, `index` steps back one week per row. */
function buildSelfHistoryEntry(index: number): SelfHistoryEntry {
  const startsAtMs = Date.now() - DAY_MS - index * 7 * DAY_MS;
  const status = SELF_HISTORY_STATUS_CYCLE[index % SELF_HISTORY_STATUS_CYCLE.length] ?? null;
  return {
    sessionId: `sess-history-${String(index + 1)}`,
    startsAt: new Date(startsAtMs).toISOString(),
    endsAt: new Date(startsAtMs + 2 * 60 * MINUTE_MS).toISOString(),
    sessionType: index % 2 === 0 ? 'practice' : 'throwing',
    status,
    latenessMinutes: status === 'present_late' ? 12 : null,
    excuseCategory: status === 'excused' ? 'travel' : null,
    source: historyEntrySource(status),
    recordedAt: status === null ? null : new Date(startsAtMs + 5 * MINUTE_MS).toISOString(),
    // The unrecorded row keeps an open sheet so the "not finalized" hint has
    // a deterministic anchor; everything else is finalized.
    sheetState: status === null ? 'open' : 'finalized',
  };
}

/** Newest-first, offset-paginated own history mirroring the A1 endpoint. */
export function buildMyAttendanceHistory(limit: number, offset: number): SelfHistory {
  const items = Array.from(
    { length: Math.max(0, Math.min(limit, SELF_HISTORY_TOTAL - offset)) },
    (_item, position) => buildSelfHistoryEntry(offset + position),
  );
  return { items, total: SELF_HISTORY_TOTAL, limit, offset };
}

/** Deterministic weighted-participation projection for the caller. */
export function buildMyParticipation(
  seasonId: string | null,
): BackendApiSchemas['ParticipationResponseDto'] {
  return { ...makeParticipationDto(), seasonId };
}
