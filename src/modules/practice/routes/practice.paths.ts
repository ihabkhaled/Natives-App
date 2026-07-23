import { APP_PATHS } from '@/shared/config';

/** The path-parameter name for a session id (without the leading colon). */
export const PRACTICE_SESSION_ID_PARAM = 'sessionId';

/** The practice calendar list route. */
export function practicesPath(): string {
  return APP_PATHS.practices;
}

/** The parameterised route pattern registered with the router. */
export function practiceSessionPattern(): string {
  return APP_PATHS.practiceSession;
}

/** A concrete session-detail path for one session id. */
export function practiceSessionPath(sessionId: string): string {
  return APP_PATHS.practiceSession.replace(
    `:${PRACTICE_SESSION_ID_PARAM}`,
    encodeURIComponent(sessionId),
  );
}

/**
 * The session-scoped attendance capture path. Derived here from the canonical
 * table rather than imported from `@/modules/attendance`: the attendance
 * module already consumes this module's public surface (the upcoming-sessions
 * read), so importing back would create a module cycle.
 */
export function sessionAttendancePath(sessionId: string): string {
  return APP_PATHS.attendance.replace(
    `:${PRACTICE_SESSION_ID_PARAM}`,
    encodeURIComponent(sessionId),
  );
}
