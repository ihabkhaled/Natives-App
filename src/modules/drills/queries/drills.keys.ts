/**
 * Team-scoped keys for the drill cache. Two teams can hold drills with
 * colliding ids, so the team segment always comes first and a write never
 * invalidates wider than the one team's catalogue it acted on.
 */
export const drillsQueryKeys = {
  all: ['drills'] as const,
  team: (teamId: string) => [...drillsQueryKeys.all, 'team', teamId] as const,
  list: (teamId: string) => [...drillsQueryKeys.team(teamId), 'list'] as const,
  detail: (teamId: string, drillId: string) =>
    [...drillsQueryKeys.team(teamId), 'detail', drillId] as const,
};
