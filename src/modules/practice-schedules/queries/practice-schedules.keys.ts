/**
 * Team-scoped keys for the schedule cache. Two teams can hold schedules with
 * colliding ids, so the team segment always comes first and a write never
 * invalidates a wider branch than the team it acted on.
 */
export const practiceSchedulesQueryKeys = {
  all: ['practice-schedules'] as const,
  team: (teamId: string) => [...practiceSchedulesQueryKeys.all, 'team', teamId] as const,
  list: (teamId: string) => [...practiceSchedulesQueryKeys.team(teamId), 'list'] as const,
  detail: (teamId: string, scheduleId: string) =>
    [...practiceSchedulesQueryKeys.team(teamId), 'detail', scheduleId] as const,
};
