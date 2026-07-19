import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { ATTENDANCE_SESSION_ID_PARAM, attendancePath, attendancePattern } from './attendance.paths';

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
});
