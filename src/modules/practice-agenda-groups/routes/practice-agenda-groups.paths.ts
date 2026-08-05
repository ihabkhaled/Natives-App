import { APP_PATHS } from '@/shared/config';

export const PRACTICE_AGENDA_GROUPS_SESSION_ID_PARAM = 'sessionId';

/** The route pattern, with its parameter still unresolved. */
export function practiceAgendaGroupsPattern(): string {
  return APP_PATHS.practiceAgendaGroups;
}

/** The groups-and-plan screen for one session id. */
export function practiceAgendaGroupsPath(sessionId: string): string {
  return APP_PATHS.practiceAgendaGroups.replace(
    `:${PRACTICE_AGENDA_GROUPS_SESSION_ID_PARAM}`,
    encodeURIComponent(sessionId),
  );
}
