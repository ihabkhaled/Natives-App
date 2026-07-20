/** Stable query-key builders for the tryouts cache. */
export const tryoutsQueryKeys = {
  all: ['tryouts'] as const,
  publicEvents: () => [...tryoutsQueryKeys.all, 'public-events'] as const,
  team: (teamId: string) => [...tryoutsQueryKeys.all, 'team', teamId] as const,
  list: (teamId: string) => [...tryoutsQueryKeys.team(teamId), 'list'] as const,
  detail: (teamId: string, tryoutId: string) =>
    [...tryoutsQueryKeys.team(teamId), 'detail', tryoutId] as const,
  candidates: (teamId: string, tryoutId: string) =>
    [...tryoutsQueryKeys.detail(teamId, tryoutId), 'candidates'] as const,
  candidate: (teamId: string, tryoutId: string, candidateId: string) =>
    [...tryoutsQueryKeys.candidates(teamId, tryoutId), candidateId] as const,
};
