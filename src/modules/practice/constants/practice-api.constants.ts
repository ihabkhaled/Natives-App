/** NestJS practice endpoints, relative to the versioned API base URL. */
export const PRACTICE_API_PATHS = {
  sessions: '/practices/sessions',
  upcoming: '/practices/sessions/upcoming',
} as const;

/** Detail path for one practice session id. */
export function practiceSessionDetailPath(sessionId: string): string {
  return `${PRACTICE_API_PATHS.sessions}/${encodeURIComponent(sessionId)}`;
}

/** Self-RSVP path for one practice session id. */
export function practiceRsvpPath(sessionId: string): string {
  return `${practiceSessionDetailPath(sessionId)}/rsvp`;
}
