/** Stable, team-scoped query-key builders for the tryout-candidate cache. */
export const tryoutCandidatesQueryKeys = {
  all: ['tryout-candidates'] as const,
  team: (teamId: string) => [...tryoutCandidatesQueryKeys.all, 'team', teamId] as const,
  list: (teamId: string, offset: number) =>
    [...tryoutCandidatesQueryKeys.team(teamId), 'list', offset] as const,
  detail: (teamId: string, candidateId: string) =>
    [...tryoutCandidatesQueryKeys.team(teamId), 'detail', candidateId] as const,
};
