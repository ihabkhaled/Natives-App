import { APP_PATHS } from '@/shared/config';

export const PRACTICE_AGENDA_SESSION_ID_PARAM = 'sessionId';

/** The route pattern, with its parameter still unresolved. */
export function practiceAgendaPattern(): string {
  return APP_PATHS.practiceAgenda;
}

/** The plan for one session id. */
export function practiceAgendaPath(sessionId: string): string {
  return APP_PATHS.practiceAgenda.replace(
    `:${PRACTICE_AGENDA_SESSION_ID_PARAM}`,
    encodeURIComponent(sessionId),
  );
}
