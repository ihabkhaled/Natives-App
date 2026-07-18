import {
  ATTENDANCE_LATE_MAX_MINUTES,
  ATTENDANCE_STATUS,
  type AttendanceStatus,
} from '../constants/attendance.constants';
import type {
  AttendanceDraft,
  AttendanceMark,
  AttendanceQueuedOperation,
  AttendanceRosterEntry,
} from '../types/attendance.types';

export function buildAttendanceDrafts(
  entries: readonly AttendanceRosterEntry[],
  queued: readonly AttendanceQueuedOperation[],
): Record<string, AttendanceDraft> {
  const queueByMember = new Map(queued.map((operation) => [operation.membershipId, operation]));
  return Object.fromEntries(
    entries.map((entry) => {
      const operation = queueByMember.get(entry.membershipId);
      return [
        entry.membershipId,
        {
          status: operation?.status ?? entry.status,
          latenessMinutes: operation?.latenessMinutes ?? entry.latenessMinutes,
          excuseCategory: operation?.excuseCategory ?? entry.excuseCategory,
          expectedVersion: entry.version,
          correctionReason: '',
        },
      ];
    }),
  );
}

export function mergeAttendanceDrafts(
  base: Readonly<Record<string, AttendanceDraft>>,
  overrides: Readonly<Record<string, AttendanceDraft>>,
): Record<string, AttendanceDraft> {
  return { ...base, ...overrides };
}

export function parseAttendanceLateness(value: string): number | null {
  if (value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.min(ATTENDANCE_LATE_MAX_MINUTES, Math.max(0, Math.trunc(parsed)))
    : null;
}

export function markAttendanceDrafts(
  drafts: Readonly<Record<string, AttendanceDraft>>,
  membershipIds: readonly string[],
  status: AttendanceStatus,
): Record<string, AttendanceDraft> {
  const selected = new Set(membershipIds);
  return Object.fromEntries(
    Object.entries(drafts).map(([id, draft]) => [
      id,
      selected.has(id)
        ? {
            ...draft,
            status,
            ...(status === ATTENDANCE_STATUS.presentOnTime
              ? { latenessMinutes: null, excuseCategory: null }
              : {}),
          }
        : draft,
    ]),
  );
}

export function buildAttendanceMarks(
  drafts: Readonly<Record<string, AttendanceDraft>>,
  dirtyIds: readonly string[],
): readonly AttendanceMark[] {
  return dirtyIds.flatMap((membershipId) => {
    const draft = drafts[membershipId];
    return draft?.status === null || draft === undefined
      ? []
      : [
          {
            membershipId,
            status: draft.status,
            latenessMinutes: draft.latenessMinutes,
            excuseCategory: draft.excuseCategory,
            expectedVersion: draft.expectedVersion,
          },
        ];
  });
}
