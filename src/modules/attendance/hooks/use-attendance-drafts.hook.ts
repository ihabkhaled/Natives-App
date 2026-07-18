import { useMemo, useState } from 'react';

import {
  ATTENDANCE_STATUS,
  type AttendanceExcuse,
  type AttendanceStatus,
} from '../constants/attendance.constants';
import {
  buildAttendanceDrafts,
  buildAttendanceMarks,
  markAttendanceDrafts,
  mergeAttendanceDrafts,
  parseAttendanceLateness,
} from '../helpers/attendance-draft.helper';
import type {
  AttendanceDraft,
  AttendanceMark,
  AttendanceQueuedOperation,
  AttendanceRosterEntry,
} from '../types/attendance.types';

export interface AttendanceDraftsView {
  readonly drafts: Readonly<Record<string, AttendanceDraft>>;
  readonly dirtyIds: readonly string[];
  readonly canUndo: boolean;
  readonly markAllPresent: () => void;
  readonly markMembers: (membershipIds: readonly string[], status: AttendanceStatus) => void;
  readonly setStatus: (membershipId: string, status: AttendanceStatus) => void;
  readonly setLateness: (membershipId: string, value: string) => void;
  readonly setExcuse: (membershipId: string, excuse: AttendanceExcuse | null) => void;
  readonly setCorrectionReason: (membershipId: string, value: string) => void;
  readonly undo: () => void;
  readonly acceptChanges: () => void;
  readonly buildMarks: () => readonly AttendanceMark[];
}

export function useAttendanceDrafts(
  entries: readonly AttendanceRosterEntry[],
  queued: readonly AttendanceQueuedOperation[],
): AttendanceDraftsView {
  const base = useMemo(() => buildAttendanceDrafts(entries, queued), [entries, queued]);
  const [overrides, setOverrides] = useState<Record<string, AttendanceDraft>>({});
  const [dirtyIds, setDirtyIds] = useState<readonly string[]>([]);
  const [previous, setPrevious] = useState<Record<string, AttendanceDraft> | null>(null);
  const drafts = useMemo(() => mergeAttendanceDrafts(base, overrides), [base, overrides]);
  const update = (
    membershipId: string,
    change: (draft: AttendanceDraft) => AttendanceDraft,
  ): void => {
    const draft = drafts[membershipId];
    if (draft === undefined) {
      return;
    }
    setPrevious(overrides);
    setOverrides((current) => ({ ...current, [membershipId]: change(draft) }));
    setDirtyIds((current) =>
      current.includes(membershipId) ? current : [...current, membershipId],
    );
  };
  const markMembers = (membershipIds: readonly string[], status: AttendanceStatus): void => {
    setPrevious(overrides);
    setOverrides(markAttendanceDrafts(drafts, membershipIds, status));
    setDirtyIds((current) => [...new Set([...current, ...membershipIds])]);
  };
  return {
    drafts,
    dirtyIds,
    canUndo: previous !== null,
    markAllPresent: () => {
      markMembers(Object.keys(drafts), ATTENDANCE_STATUS.presentOnTime);
    },
    markMembers,
    setStatus: (membershipId, status) => {
      update(membershipId, (draft) => ({
        ...draft,
        status,
        ...(status === ATTENDANCE_STATUS.presentLate ? {} : { latenessMinutes: null }),
        ...(status === ATTENDANCE_STATUS.excused ? {} : { excuseCategory: null }),
      }));
    },
    setLateness: (membershipId, value) => {
      update(membershipId, (draft) => ({
        ...draft,
        latenessMinutes: parseAttendanceLateness(value),
      }));
    },
    setExcuse: (membershipId, excuse) => {
      update(membershipId, (draft) => ({ ...draft, excuseCategory: excuse }));
    },
    setCorrectionReason: (membershipId, value) => {
      update(membershipId, (draft) => ({ ...draft, correctionReason: value }));
    },
    undo: () => {
      if (previous !== null) {
        setOverrides(previous);
        setPrevious(null);
        setDirtyIds([]);
      }
    },
    acceptChanges: () => {
      setOverrides({});
      setDirtyIds([]);
      setPrevious(null);
    },
    buildMarks: () => buildAttendanceMarks(drafts, dirtyIds),
  };
}
