export const attendanceQueryKeys = {
  all: ['attendance'] as const,
  team: (teamId: string) => [...attendanceQueryKeys.all, 'team', teamId] as const,
  sheet: (teamId: string, sessionId: string) =>
    [...attendanceQueryKeys.team(teamId), 'sheet', sessionId] as const,
  history: (teamId: string, sessionId: string, membershipId: string) =>
    [...attendanceQueryKeys.sheet(teamId, sessionId), 'history', membershipId] as const,
  self: (teamId: string, sessionId: string) =>
    [...attendanceQueryKeys.team(teamId), 'self', sessionId] as const,
  participationFamily: (teamId: string) =>
    [...attendanceQueryKeys.team(teamId), 'participation'] as const,
  participation: (teamId: string, seasonId: string | null) =>
    [...attendanceQueryKeys.participationFamily(teamId), seasonId ?? 'all'] as const,
  selfHistoryFamily: (teamId: string) =>
    [...attendanceQueryKeys.team(teamId), 'self-history'] as const,
  selfHistory: (teamId: string, limit: number) =>
    [...attendanceQueryKeys.selfHistoryFamily(teamId), limit] as const,
};
