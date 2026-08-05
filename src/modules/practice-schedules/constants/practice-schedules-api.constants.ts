/** NestJS practice-schedule endpoints, relative to the versioned API base URL. */
const SCHEDULES_API_PATHS = {
  teams: '/teams',
  schedules: 'practice-schedules',
  generate: 'generate',
} as const;

function schedulesBasePath(teamId: string): string {
  return `${SCHEDULES_API_PATHS.teams}/${encodeURIComponent(teamId)}/${SCHEDULES_API_PATHS.schedules}`;
}

/** The team's recurring-pattern catalogue. Also the create target (POST). */
export function scheduleCollectionPath(teamId: string): string {
  return schedulesBasePath(teamId);
}

/** One schedule: read, patch, or archive (DELETE), depending on the verb. */
export function scheduleItemPath(teamId: string, scheduleId: string): string {
  return `${schedulesBasePath(teamId)}/${encodeURIComponent(scheduleId)}`;
}

/**
 * Turn the pattern into real sessions. Idempotent on the server: re-running it
 * for a window already generated reports those occurrences as skipped rather
 * than duplicating them.
 */
export function scheduleGeneratePath(teamId: string, scheduleId: string): string {
  return `${scheduleItemPath(teamId, scheduleId)}/${SCHEDULES_API_PATHS.generate}`;
}
