import {
  ATTENDANCE_SHEET_STATE,
  type AttendanceQueuedOperation,
  type AttendanceRosterEntry,
  type AttendanceSheet,
} from '@/modules/attendance';

/** Deterministic domain-shaped attendance samples shared by the module's unit tests. */
export function makeRosterEntry(
  overrides: Partial<AttendanceRosterEntry> = {},
): AttendanceRosterEntry {
  return {
    membershipId: 'm-1',
    userId: 'user-1',
    status: 'present_on_time',
    checkInAtIso: null,
    latenessMinutes: null,
    excuseCategory: null,
    version: 1,
    ...overrides,
  };
}

export function makeAttendanceSheet(overrides: Partial<AttendanceSheet> = {}): AttendanceSheet {
  const items = overrides.items ?? [makeRosterEntry()];
  return {
    sessionId: 'sess-1',
    state: ATTENDANCE_SHEET_STATE.open,
    finalizedAtIso: null,
    version: 3,
    total: items.length,
    ...overrides,
    items,
  };
}

export function makeQueuedOperation(
  overrides: Partial<AttendanceQueuedOperation> = {},
): AttendanceQueuedOperation {
  return {
    operationId: 'op-1',
    teamId: 'team-1',
    sessionId: 'sess-1',
    membershipId: 'm-1',
    status: 'present_on_time',
    latenessMinutes: null,
    excuseCategory: null,
    expectedVersion: 1,
    state: 'pending',
    retryCount: 0,
    createdAtIso: '2026-07-26T15:05:00.000Z',
    ...overrides,
  };
}
