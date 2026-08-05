/**
 * Team-then-session-scoped keys for the RSVP-detail cache. Two teams can hold
 * sessions with colliding ids, so the team segment comes first and an
 * override invalidates no wider than the one session it acted on.
 */
export const practiceRsvpDetailQueryKeys = {
  all: ['practice-rsvp-detail'] as const,
  team: (teamId: string) => [...practiceRsvpDetailQueryKeys.all, 'team', teamId] as const,
  session: (teamId: string, sessionId: string) =>
    [...practiceRsvpDetailQueryKeys.team(teamId), 'session', sessionId] as const,
  participants: (teamId: string, sessionId: string, limit: number, status: string) =>
    [
      ...practiceRsvpDetailQueryKeys.session(teamId, sessionId),
      'participants',
      limit,
      status,
    ] as const,
  summary: (teamId: string, sessionId: string) =>
    [...practiceRsvpDetailQueryKeys.session(teamId, sessionId), 'summary'] as const,
  history: (teamId: string, sessionId: string, membershipId: string) =>
    [...practiceRsvpDetailQueryKeys.session(teamId, sessionId), 'history', membershipId] as const,
};
