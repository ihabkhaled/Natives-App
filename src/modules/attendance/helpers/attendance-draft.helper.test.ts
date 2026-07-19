import { describe, expect, it } from 'vitest';

import { makeQueuedOperation, makeRosterEntry } from '@/tests/msw/attendance-domain.fixture';

import { ATTENDANCE_STATUS } from '../constants/attendance.constants';
import type { AttendanceDraft } from '../types/attendance.types';
import {
  buildAttendanceDrafts,
  buildAttendanceMarks,
  markAttendanceDrafts,
  mergeAttendanceDrafts,
  parseAttendanceLateness,
} from './attendance-draft.helper';

describe('buildAttendanceDrafts', () => {
  it('prefers a pending queued operation over the persisted entry status', () => {
    const drafts = buildAttendanceDrafts(
      [makeRosterEntry()],
      [makeQueuedOperation({ status: 'present_late', latenessMinutes: 9 })],
    );

    expect(drafts['m-1']?.status).toBe('present_late');
    expect(drafts['m-1']?.latenessMinutes).toBe(9);
    expect(drafts['m-1']?.correctionReason).toBe('');
  });

  it('falls back to the entry status when no operation is queued', () => {
    const drafts = buildAttendanceDrafts(
      [makeRosterEntry({ status: 'excused', excuseCategory: 'travel' })],
      [],
    );

    expect(drafts['m-1']?.status).toBe('excused');
    expect(drafts['m-1']?.excuseCategory).toBe('travel');
  });
});

describe('mergeAttendanceDrafts', () => {
  it('overlays overrides on the base drafts', () => {
    const base = buildAttendanceDrafts([makeRosterEntry()], []);
    const override: AttendanceDraft = {
      status: 'absent',
      latenessMinutes: null,
      excuseCategory: null,
      expectedVersion: 1,
      correctionReason: '',
    };

    expect(mergeAttendanceDrafts(base, { 'm-1': override })['m-1']?.status).toBe('absent');
  });
});

describe('parseAttendanceLateness', () => {
  it('treats blank input as no lateness', () => {
    expect(parseAttendanceLateness('')).toBeNull();
    expect(parseAttendanceLateness('   ')).toBeNull();
  });

  it('clamps and truncates finite numbers into the supported range', () => {
    expect(parseAttendanceLateness('15.7')).toBe(15);
    expect(parseAttendanceLateness('-5')).toBe(0);
    expect(parseAttendanceLateness('99999')).toBe(1440);
  });

  it('rejects non-numeric input', () => {
    expect(parseAttendanceLateness('abc')).toBeNull();
  });
});

describe('markAttendanceDrafts', () => {
  it('clears lateness and excuse when marking present on time', () => {
    const drafts = buildAttendanceDrafts(
      [makeRosterEntry({ status: 'present_late', latenessMinutes: 20, excuseCategory: 'work' })],
      [],
    );

    const marked = markAttendanceDrafts(drafts, ['m-1'], ATTENDANCE_STATUS.presentOnTime);

    expect(marked['m-1']?.status).toBe('present_on_time');
    expect(marked['m-1']?.latenessMinutes).toBeNull();
    expect(marked['m-1']?.excuseCategory).toBeNull();
  });

  it('keeps other fields when marking a non-present status and skips unselected rows', () => {
    const drafts = buildAttendanceDrafts(
      [makeRosterEntry({ latenessMinutes: 5 }), makeRosterEntry({ membershipId: 'm-2' })],
      [],
    );

    const marked = markAttendanceDrafts(drafts, ['m-1'], ATTENDANCE_STATUS.absent);

    expect(marked['m-1']?.status).toBe('absent');
    expect(marked['m-1']?.latenessMinutes).toBe(5);
    expect(marked['m-2']?.status).toBe('present_on_time');
  });
});

describe('buildAttendanceMarks', () => {
  it('emits marks only for dirty rows with a resolved status', () => {
    const drafts = buildAttendanceDrafts(
      [makeRosterEntry(), makeRosterEntry({ membershipId: 'm-2', status: null })],
      [],
    );

    const marks = buildAttendanceMarks(drafts, ['m-1', 'm-2', 'm-missing']);

    expect(marks).toHaveLength(1);
    expect(marks[0]?.membershipId).toBe('m-1');
  });
});
