/** NestJS practice-reminder endpoints, relative to the versioned API base URL. */
const REMINDERS_API_PATHS = {
  teams: '/teams',
  sessions: 'practice-sessions',
  reminders: 'reminders',
} as const;

function remindersBasePath(teamId: string, sessionId: string): string {
  return `${REMINDERS_API_PATHS.teams}/${encodeURIComponent(teamId)}/${REMINDERS_API_PATHS.sessions}/${encodeURIComponent(sessionId)}/${REMINDERS_API_PATHS.reminders}`;
}

/**
 * Read-only reminder state for a session. Separate from `preview` on purpose:
 * this one is the coach's view and is safe to poll from a screen, where
 * `preview` is the dispatcher's dry run.
 */
export function reminderStatusPath(teamId: string, sessionId: string): string {
  return `${remindersBasePath(teamId, sessionId)}/status`;
}

/** Dry run: what a dispatch would send right now, without sending it. */
export function reminderPreviewPath(teamId: string, sessionId: string): string {
  return `${remindersBasePath(teamId, sessionId)}/preview`;
}

/** Enqueue the reminders that are actually due for this session. */
export function reminderDispatchPath(teamId: string, sessionId: string): string {
  return `${remindersBasePath(teamId, sessionId)}/dispatch`;
}

/**
 * Send one reminder to the caller alone. The safe way to check delivery
 * without mailing a roster — the server resolves the recipient from the token,
 * so this can never be aimed at somebody else.
 */
export function reminderTestPath(teamId: string, sessionId: string): string {
  return `${remindersBasePath(teamId, sessionId)}/test`;
}
