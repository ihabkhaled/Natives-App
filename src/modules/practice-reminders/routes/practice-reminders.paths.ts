import { APP_PATHS } from '@/shared/config';

export const PRACTICE_REMINDERS_SESSION_ID_PARAM = 'sessionId';

/** The route pattern, with its parameter still unresolved. */
export function practiceRemindersPattern(): string {
  return APP_PATHS.practiceReminders;
}

/** The reminders screen for one session id. */
export function practiceRemindersPath(sessionId: string): string {
  return APP_PATHS.practiceReminders.replace(
    `:${PRACTICE_REMINDERS_SESSION_ID_PARAM}`,
    encodeURIComponent(sessionId),
  );
}
