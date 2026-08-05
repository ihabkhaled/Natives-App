/**
 * Team-then-session-scoped keys for the groups-and-plan cache. Two teams can
 * hold sessions with colliding ids, so the team segment comes first and every
 * mutation invalidates no wider than the one session it acted on.
 */
export const practiceAgendaGroupsQueryKeys = {
  all: ['practice-agenda-groups'] as const,
  team: (teamId: string) => [...practiceAgendaGroupsQueryKeys.all, 'team', teamId] as const,
  plan: (teamId: string, sessionId: string) =>
    [...practiceAgendaGroupsQueryKeys.team(teamId), 'plan', sessionId] as const,
};
