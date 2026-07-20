/** Stable, team-scoped query-key builders for the points cache. */
export const pointsQueryKeys = {
  all: ['points'] as const,
  team: (teamId: string) => [...pointsQueryKeys.all, 'team', teamId] as const,
  leaderboard: (teamId: string, period: string, cohort: string, category: string) =>
    [...pointsQueryKeys.team(teamId), 'leaderboard', period, cohort, category] as const,
  mine: (teamId: string) => [...pointsQueryKeys.team(teamId), 'mine'] as const,
};
