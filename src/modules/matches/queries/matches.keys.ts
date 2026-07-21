/** Stable, team-scoped query-key builders for the matches cache. */
export const matchesQueryKeys = {
  all: ['matches'] as const,
  team: (teamId: string) => [...matchesQueryKeys.all, 'team', teamId] as const,
  list: (teamId: string) => [...matchesQueryKeys.team(teamId), 'list'] as const,
  detail: (teamId: string, matchId: string) =>
    [...matchesQueryKeys.team(teamId), 'detail', matchId] as const,
  scoreboard: (teamId: string, matchId: string) =>
    [...matchesQueryKeys.detail(teamId, matchId), 'scoreboard'] as const,
  events: (teamId: string, matchId: string) =>
    [...matchesQueryKeys.detail(teamId, matchId), 'events'] as const,
  statistics: (teamId: string, matchId: string) =>
    [...matchesQueryKeys.detail(teamId, matchId), 'statistics'] as const,
  rulesets: (teamId: string) => [...matchesQueryKeys.team(teamId), 'rulesets'] as const,
};
