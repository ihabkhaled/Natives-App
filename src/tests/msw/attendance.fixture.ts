import type {
  attendanceRecordResponseSchema,
  attendanceSheetResponseSchema,
} from '@/modules/attendance';
import type { BackendApiSchemas } from '@/packages/api-contract';
import type { SchemaOutput } from '@/packages/schema';

import { makeParticipationDto } from './attendance-wire.fixture';
import { MOCK_ATTENDANCE } from './mock-data.constants';

/**
 * The attendance sheet row. Sourced from the client schema rather than the
 * generated `RosterEntryResponseDto`, whose name the backend now also uses for
 * competition roster entries.
 */
type RosterEntry = SchemaOutput<typeof attendanceSheetResponseSchema>['items'][number];
type AttendanceRecord = SchemaOutput<typeof attendanceRecordResponseSchema>;
type BulkMark = BackendApiSchemas['BulkMarkEntryDto'];
type Mark = BackendApiSchemas['MarkAttendanceDto'];
type Correction = BackendApiSchemas['CorrectAttendanceDto'];
type Revision = BackendApiSchemas['AttendanceRevisionResponseDto'];

const RECORDED_AT = '2026-07-26T15:05:00.000Z';
const FINALIZED_AT = '2026-07-26T17:10:00.000Z';

const INITIAL_ROSTER: readonly RosterEntry[] = [
  {
    membershipId: MOCK_ATTENDANCE.presentMembershipId,
    userId: 'user-player-1',
    status: 'present_on_time',
    checkInAt: '2026-07-26T14:58:00.000Z',
    latenessMinutes: null,
    excuseCategory: null,
    source: 'coach',
    version: 1,
  },
  {
    membershipId: MOCK_ATTENDANCE.lateMembershipId,
    userId: 'user-player-2',
    status: 'present_late',
    checkInAt: '2026-07-26T15:12:00.000Z',
    latenessMinutes: 12,
    excuseCategory: null,
    source: 'coach',
    version: 2,
  },
  {
    membershipId: MOCK_ATTENDANCE.conflictMembershipId,
    userId: 'user-player-3',
    status: null,
    checkInAt: null,
    latenessMinutes: null,
    excuseCategory: null,
    source: null,
    version: null,
  },
  {
    membershipId: MOCK_ATTENDANCE.historicalMembershipId,
    userId: null,
    status: 'excused',
    checkInAt: null,
    latenessMinutes: null,
    excuseCategory: 'travel',
    source: 'coach',
    version: 1,
  },
];

/** The caller's own membership scope, mirroring `buildAuthMembership`. */
const SELF_MEMBERSHIP_ID = 'membership-natives-1';
const SELF_CHECK_IN_AT = '2026-07-26T14:59:00.000Z';

function emptySelfRecord(): AttendanceRecord {
  return {
    sessionId: MOCK_ATTENDANCE.sessionId,
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

let roster = INITIAL_ROSTER.map((entry) => ({ ...entry }));
let sheetState: 'open' | 'finalized' | 'corrected' = 'open';
let sheetVersion = 3;
let finalizedAt: string | null = null;
let replayConflictAvailable = true;
let selfRecord = emptySelfRecord();
const historyByMember = new Map<string, Revision[]>();

export function resetMockAttendanceState(): void {
  roster = INITIAL_ROSTER.map((entry) => ({ ...entry }));
  sheetState = 'open';
  sheetVersion = 3;
  finalizedAt = null;
  replayConflictAvailable = true;
  selfRecord = emptySelfRecord();
  historyByMember.clear();
}

/** Own per-session record; `status: null` mirrors the backend notRecordedView. */
export function buildMyAttendance(sessionId: string): AttendanceRecord {
  return { ...selfRecord, sessionId };
}

/**
 * Self check-in mirrors the CURRENT deployed contract: the status derives from
 * the clock and a repeat POST upserts (no window, no idempotency — those are
 * the Wave B1 hardenings, deliberately NOT faked here).
 */
export function applySelfCheckIn(sessionId: string): AttendanceRecord {
  selfRecord = {
    ...selfRecord,
    sessionId,
    status: 'present_on_time',
    checkInAt: SELF_CHECK_IN_AT,
    source: 'self',
    recordedAt: SELF_CHECK_IN_AT,
    version: (selfRecord.version ?? 0) + 1,
  };
  return { ...selfRecord };
}

/** Deterministic weighted-participation projection for the caller. */
export function buildMyParticipation(
  seasonId: string | null,
): BackendApiSchemas['ParticipationResponseDto'] {
  return { ...makeParticipationDto(), seasonId };
}

export function buildAttendanceSheet(limit: number, offset: number) {
  return {
    sessionId: MOCK_ATTENDANCE.sessionId,
    state: sheetState,
    finalizedAt,
    version: sheetVersion,
    items: roster.slice(offset, offset + limit),
    total: roster.length,
    limit,
    offset,
  };
}

function findRosterEntry(membershipId: string): RosterEntry | undefined {
  return roster.find((entry) => entry.membershipId === membershipId);
}

function hasVersionConflict(membershipId: string, expectedVersion: number | undefined): boolean {
  const current = findRosterEntry(membershipId);
  return (
    current === undefined || (expectedVersion !== undefined && current.version !== expectedVersion)
  );
}

function recordFromEntry(entry: RosterEntry): AttendanceRecord {
  return {
    sessionId: MOCK_ATTENDANCE.sessionId,
    membershipId: entry.membershipId,
    status: entry.status,
    checkInAt: entry.checkInAt,
    checkOutAt: null,
    latenessMinutes: entry.latenessMinutes,
    excuseCategory: entry.excuseCategory,
    source: entry.source,
    recordedAt: RECORDED_AT,
    version: entry.version,
  };
}

function applyMark(membershipId: string, mark: Mark | BulkMark): AttendanceRecord {
  const current = findRosterEntry(membershipId);
  if (current === undefined) {
    throw new Error('mock attendance member missing');
  }
  const next: RosterEntry = {
    ...current,
    status: mark.status,
    checkInAt:
      mark.checkInAt ??
      (mark.status === 'present_on_time' || mark.status === 'present_late' ? RECORDED_AT : null),
    latenessMinutes: mark.latenessMinutes ?? null,
    excuseCategory: mark.excuseCategory ?? null,
    source: 'coach',
    version: (current.version ?? 0) + 1,
  };
  roster = roster.map((entry) => (entry.membershipId === membershipId ? next : entry));
  sheetVersion += 1;
  return recordFromEntry(next);
}

export function applyBulkAttendance(
  marks: readonly BulkMark[],
): BackendApiSchemas['BulkRecordResponseDto'] | null {
  const hasConflict = marks.some((mark) =>
    hasVersionConflict(mark.membershipId, mark.expectedVersion),
  );
  if (hasConflict) {
    return null;
  }
  // Contract 1.4.0 added `selfCheckIn` eligibility to every bulk record row;
  // coach-marked rows carry no self-check-in context, honestly null.
  const items = marks.map((mark) => ({ ...applyMark(mark.membershipId, mark), selfCheckIn: null }));
  return { items, recorded: items.length };
}

export function applyOneAttendance(membershipId: string, mark: Mark): AttendanceRecord | null {
  if (hasVersionConflict(membershipId, mark.expectedVersion)) {
    return null;
  }
  return applyMark(membershipId, mark);
}

export function consumeReplayConflict(membershipId: string): boolean {
  if (membershipId === MOCK_ATTENDANCE.conflictMembershipId && replayConflictAvailable) {
    replayConflictAvailable = false;
    return true;
  }
  return false;
}

export function finalizeAttendanceSheet(
  expectedVersion: number,
): BackendApiSchemas['AttendanceStatusResponseDto'] | null {
  if (expectedVersion !== sheetVersion || sheetState !== 'open') {
    return null;
  }
  sheetState = 'finalized';
  sheetVersion += 1;
  finalizedAt = FINALIZED_AT;
  return {
    sessionId: MOCK_ATTENDANCE.sessionId,
    state: sheetState,
    finalizedAt,
    recordCount: roster.filter((entry) => entry.status !== null).length,
    version: sheetVersion,
  };
}

export function correctAttendanceRecord(
  membershipId: string,
  correction: Correction,
): AttendanceRecord | null {
  const current = findRosterEntry(membershipId);
  if (
    current === undefined ||
    sheetState === 'open' ||
    hasVersionConflict(membershipId, correction.expectedVersion)
  ) {
    return null;
  }
  const previousStatus = current.status;
  const record = applyMark(membershipId, correction);
  sheetState = 'corrected';
  const revisions = historyByMember.get(membershipId) ?? [];
  revisions.push({
    id: `revision-${revisions.length + 1}`,
    membershipId,
    fromStatus: previousStatus,
    toStatus: correction.status,
    latenessMinutes: correction.latenessMinutes ?? null,
    excuseCategory: correction.excuseCategory ?? null,
    source: 'coach',
    isCorrection: true,
    correctionReason: correction.reason,
    actorUserId: 'user-coach',
    occurredAt: RECORDED_AT,
  });
  historyByMember.set(membershipId, revisions);
  return record;
}

export function buildAttendanceHistory(
  membershipId: string,
): BackendApiSchemas['AttendanceHistoryResponseDto'] {
  return { items: historyByMember.get(membershipId) ?? [] };
}
