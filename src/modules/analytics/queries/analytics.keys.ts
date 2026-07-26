/** Stable, team-scoped query-key builders for the analytics cache. */
export const analyticsQueryKeys = {
  all: ['analytics'] as const,
  team: (teamId: string) => [...analyticsQueryKeys.all, 'team', teamId] as const,
  teamSeries: (teamId: string, dimension: string, periodType: string) =>
    [...analyticsQueryKeys.team(teamId), 'team-series', dimension, periodType] as const,
  playerSeries: (teamId: string, subjectId: string, dimension: string, periodType: string) =>
    [
      ...analyticsQueryKeys.team(teamId),
      'player-series',
      subjectId,
      dimension,
      periodType,
    ] as const,
  cohort: (teamId: string, dimension: string, periodType: string, periodKey: string) =>
    [...analyticsQueryKeys.team(teamId), 'cohort', dimension, periodType, periodKey] as const,
};
