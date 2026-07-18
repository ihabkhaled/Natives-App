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
