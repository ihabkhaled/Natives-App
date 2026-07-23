import { APP_PATHS } from '@/shared/config';

export const ATTENDANCE_SESSION_ID_PARAM = 'sessionId';

export function attendancePattern(): string {
  return APP_PATHS.attendance;
}

export function attendancePath(sessionId: string): string {
  return APP_PATHS.attendance.replace(
    `:${ATTENDANCE_SESSION_ID_PARAM}`,
    encodeURIComponent(sessionId),
  );
}

/** Route pattern and navigation target for the member self-attendance screen. */
export function myAttendancePath(): string {
  return APP_PATHS.myAttendance;
}
