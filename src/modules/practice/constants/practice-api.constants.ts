/** NestJS practice endpoints, relative to the versioned API base URL. */
export const PRACTICE_API_PATHS = {
  teams: '/teams',
} as const;

/** Calendar path for the authenticated member's selected team. */
export function practiceSessionsPath(teamId: string): string {
  return `${PRACTICE_API_PATHS.teams}/${encodeURIComponent(teamId)}/practice-sessions`;
}

/** Detail path for one practice session id. */
export function practiceSessionDetailPath(teamId: string, sessionId: string): string {
  return `${practiceSessionsPath(teamId)}/${encodeURIComponent(sessionId)}`;
}

/** Self-RSVP path for one practice session id. */
export function practiceRsvpPath(teamId: string, sessionId: string): string {
  return `${practiceSessionDetailPath(teamId, sessionId)}/rsvp`;
}
