/**
 * Team-then-session-scoped keys for the reminder cache. Two teams can hold
 * sessions with colliding ids, so the team segment comes first and a dispatch
 * invalidates no wider than the one session it acted on.
 */
export const practiceRemindersQueryKeys = {
  all: ['practice-reminders'] as const,
  team: (teamId: string) => [...practiceRemindersQueryKeys.all, 'team', teamId] as const,
  status: (teamId: string, sessionId: string) =>
    [...practiceRemindersQueryKeys.team(teamId), 'status', sessionId] as const,
};
