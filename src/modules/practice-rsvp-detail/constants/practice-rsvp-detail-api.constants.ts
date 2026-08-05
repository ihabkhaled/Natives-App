/** NestJS practice-RSVP-detail endpoints, relative to the versioned API base URL. */
const RSVP_DETAIL_API_PATHS = {
  teams: '/teams',
  sessions: 'practice-sessions',
  rsvps: 'rsvps',
  summary: 'summary',
  history: 'history',
} as const;

function rsvpsBasePath(teamId: string, sessionId: string): string {
  return `${RSVP_DETAIL_API_PATHS.teams}/${encodeURIComponent(teamId)}/${RSVP_DETAIL_API_PATHS.sessions}/${encodeURIComponent(sessionId)}/${RSVP_DETAIL_API_PATHS.rsvps}`;
}

/** The coach's roster read: every participant's current RSVP. */
export function rsvpParticipantsPath(teamId: string, sessionId: string): string {
  return rsvpsBasePath(teamId, sessionId);
}

/** Privacy-safe planning counts; carries no membership identifiers. */
export function rsvpSummaryPath(teamId: string, sessionId: string): string {
  return `${rsvpsBasePath(teamId, sessionId)}/${RSVP_DETAIL_API_PATHS.summary}`;
}

/** Override one member's RSVP on their behalf. */
export function rsvpOverridePath(teamId: string, sessionId: string, membershipId: string): string {
  return `${rsvpsBasePath(teamId, sessionId)}/${encodeURIComponent(membershipId)}`;
}

/** One member's full revision trail — the reason the override endpoint is trustworthy. */
export function rsvpHistoryPath(teamId: string, sessionId: string, membershipId: string): string {
  return `${rsvpOverridePath(teamId, sessionId, membershipId)}/${RSVP_DETAIL_API_PATHS.history}`;
}
