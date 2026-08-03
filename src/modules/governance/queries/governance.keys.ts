/** Stable, team-scoped query-key builders for the governance cache. */
export const governanceQueryKeys = {
  all: ['governance'] as const,
  team: (teamId: string) => [...governanceQueryKeys.all, 'team', teamId] as const,
  meetings: (teamId: string, offset: number) =>
    [...governanceQueryKeys.team(teamId), 'meetings', offset] as const,
  tasks: (teamId: string, offset: number) =>
    [...governanceQueryKeys.team(teamId), 'tasks', offset] as const,
};
