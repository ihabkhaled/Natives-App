/** Stable, team-scoped query-key builders for the standings cache. */
export const standingsQueryKeys = {
  all: ['standings'] as const,
  team: (teamId: string) => [...standingsQueryKeys.all, 'team', teamId] as const,
  table: (teamId: string, competitionId: string, source: string) =>
    [...standingsQueryKeys.team(teamId), 'table', competitionId, source] as const,
  rules: (teamId: string) => [...standingsQueryKeys.team(teamId), 'rules'] as const,
  achievements: (teamId: string, status: string, category: string, offset: number) =>
    [...standingsQueryKeys.team(teamId), 'achievements', status, category, offset] as const,
  achievement: (teamId: string, achievementId: string) =>
    [...standingsQueryKeys.team(teamId), 'achievement', achievementId] as const,
  history: (teamId: string, category: string, offset: number) =>
    [...standingsQueryKeys.team(teamId), 'history', category, offset] as const,
};
