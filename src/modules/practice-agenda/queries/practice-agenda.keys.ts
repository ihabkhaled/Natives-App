/**
 * Stable, team-then-session-scoped query keys for the agenda cache. Two teams
 * can hold sessions with colliding ids, so the team segment comes first and
 * every invalidation is scoped no wider than one session's plan.
 */
export const practiceAgendaQueryKeys = {
  all: ['practice-agenda'] as const,
  team: (teamId: string) => [...practiceAgendaQueryKeys.all, 'team', teamId] as const,
  agenda: (teamId: string, sessionId: string) =>
    [...practiceAgendaQueryKeys.team(teamId), 'agenda', sessionId] as const,
};
