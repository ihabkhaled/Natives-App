export const attendanceQueryKeys = {
  all: ['attendance'] as const,
  team: (teamId: string) => [...attendanceQueryKeys.all, 'team', teamId] as const,
  sheet: (teamId: string, sessionId: string) =>
    [...attendanceQueryKeys.team(teamId), 'sheet', sessionId] as const,
  history: (teamId: string, sessionId: string, membershipId: string) =>
    [...attendanceQueryKeys.sheet(teamId, sessionId), 'history', membershipId] as const,
};
