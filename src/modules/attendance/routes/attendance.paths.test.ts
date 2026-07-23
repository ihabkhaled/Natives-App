import { assert, describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { NAV_GROUP, ROUTE_ACCESS } from '@/shared/types';
import { PERMISSIONS } from '@/shared/security';

import {
  ATTENDANCE_SESSION_ID_PARAM,
  attendancePath,
  attendancePattern,
  myAttendancePath,
} from './attendance.paths';
import { getAttendanceRouteDefinitions } from './attendance.routes';

describe('attendance path builders', () => {
  it('exposes the canonical route pattern', () => {
    expect(attendancePattern()).toBe(APP_PATHS.attendance);
    expect(attendancePattern()).toBe('/practices/:sessionId/attendance');
  });

  it('substitutes the encoded session id into the pattern', () => {
    expect(attendancePath('sess-1')).toBe('/practices/sess-1/attendance');
    expect(attendancePath('sess/7')).toBe('/practices/sess%2F7/attendance');
  });

  it('pins the session id route parameter name', () => {
    expect(ATTENDANCE_SESSION_ID_PARAM).toBe('sessionId');
  });

  it('derives the member self-attendance path from the canonical table', () => {
    expect(myAttendancePath()).toBe(APP_PATHS.myAttendance);
    expect(myAttendancePath()).toBe('/my-attendance');
  });
});

describe('getAttendanceRouteDefinitions', () => {
  const [capture, self] = getAttendanceRouteDefinitions();

  it('keeps the coach capture screen session-scoped and out of the nav (D6)', () => {
    assert(capture?.meta !== undefined);
    expect(capture.meta.key).toBe('coach-attendance');
    expect(capture.meta.permissions).toEqual([PERMISSIONS.attendanceMark]);
    expect(capture.meta.nav).toBeNull();
  });

  it('places My attendance in the Team group at order 12 behind the self grant', () => {
    assert(self?.meta !== undefined);
    expect(self.path).toBe('/my-attendance');
    expect(self.access).toBe(ROUTE_ACCESS.Protected);
    expect(self.meta.permissions).toEqual([PERMISSIONS.attendanceReadSelf]);
    expect(self.meta.requiresTeamContext).toBe(true);
    expect(self.meta.offline).toBe(true);
    expect(self.meta.nav).toEqual({
      order: 12,
      group: NAV_GROUP.Team,
      iconName: 'checkmark',
      labelKey: 'attendance.selfNavLabel',
    });
  });
});
