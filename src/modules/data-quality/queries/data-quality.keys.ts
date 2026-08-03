/** Stable, team-scoped query-key builders for the data-quality cache. */
export const dataQualityQueryKeys = {
  all: ['data-quality'] as const,
  team: (teamId: string) => [...dataQualityQueryKeys.all, 'team', teamId] as const,
  anomalies: (teamId: string, offset: number) =>
    [...dataQualityQueryKeys.team(teamId), 'anomalies', offset] as const,
  repairPreview: (teamId: string, anomalyId: string) =>
    [...dataQualityQueryKeys.team(teamId), 'repair-preview', anomalyId] as const,
};
