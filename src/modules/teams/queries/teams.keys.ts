/** Stable query-key builders for the teams cache. */
export const teamsQueryKeys = {
  all: ['teams'] as const,
  list: () => [...teamsQueryKeys.all, 'list'] as const,
  seasons: (teamId: string) => [...teamsQueryKeys.all, 'seasons', teamId] as const,
  roleMatrix: (teamId: string) => [...teamsQueryKeys.all, 'role-matrix', teamId] as const,
};
