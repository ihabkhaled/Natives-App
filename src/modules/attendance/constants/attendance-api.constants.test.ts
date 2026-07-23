import { describe, expect, it } from 'vitest';

import {
  attendanceBulkPath,
  attendanceCheckInPath,
  attendanceCorrectionPath,
  attendanceFinalizePath,
  attendanceHistoryPath,
  attendanceMemberPath,
  attendanceParticipationSelfPath,
  attendanceRosterPath,
  attendanceSelfHistoryPath,
  attendanceSelfPath,
} from './attendance-api.constants';

describe('attendance API path builders', () => {
  it('builds the team- and session-scoped roster path', () => {
    expect(attendanceRosterPath('team-1', 'sess-1')).toBe(
      '/teams/team-1/practice-sessions/sess-1/attendance',
    );
  });

  it('encodes each dynamic path segment', () => {
    expect(attendanceMemberPath('team/1', 'sess 7', 'm#3')).toBe(
      '/teams/team%2F1/practice-sessions/sess%207/attendance/m%233',
    );
  });

  it('derives the member-scoped correction and history paths', () => {
    expect(attendanceCorrectionPath('team-1', 'sess-1', 'm-2')).toBe(
      '/teams/team-1/practice-sessions/sess-1/attendance/m-2/correction',
    );
    expect(attendanceHistoryPath('team-1', 'sess-1', 'm-2')).toBe(
      '/teams/team-1/practice-sessions/sess-1/attendance/m-2/history',
    );
  });

  it('derives the bulk and finalize action paths', () => {
    expect(attendanceBulkPath('team-1', 'sess-1')).toBe(
      '/teams/team-1/practice-sessions/sess-1/attendance/bulk',
    );
    expect(attendanceFinalizePath('team-1', 'sess-1')).toBe(
      '/teams/team-1/practice-sessions/sess-1/attendance/finalize',
    );
  });

  it('derives the self record and check-in paths without a membership param', () => {
    expect(attendanceSelfPath('team-1', 'sess-1')).toBe(
      '/teams/team-1/practice-sessions/sess-1/attendance/me',
    );
    expect(attendanceCheckInPath('team-1', 'sess-1')).toBe(
      '/teams/team-1/practice-sessions/sess-1/attendance/check-in',
    );
  });

  it('derives the encoded own-participation path', () => {
    expect(attendanceParticipationSelfPath('team/1')).toBe(
      '/teams/team%2F1/attendance/me/participation',
    );
  });

  it('derives the encoded own-history path', () => {
    expect(attendanceSelfHistoryPath('team/1')).toBe('/teams/team%2F1/attendance/me/history');
  });
});
