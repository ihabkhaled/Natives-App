/** Stable, team-scoped query-key builders for the competitions cache. */
export const competitionsQueryKeys = {
  all: ['competitions'] as const,
  team: (teamId: string) => [...competitionsQueryKeys.all, 'team', teamId] as const,
  list: (teamId: string) => [...competitionsQueryKeys.team(teamId), 'list'] as const,
  detail: (teamId: string, competitionId: string) =>
    [...competitionsQueryKeys.team(teamId), 'detail', competitionId] as const,
  structure: (teamId: string, competitionId: string) =>
    [...competitionsQueryKeys.detail(teamId, competitionId), 'structure'] as const,
  fixtures: (teamId: string, competitionId: string) =>
    [...competitionsQueryKeys.detail(teamId, competitionId), 'fixtures'] as const,
  opponents: (teamId: string) => [...competitionsQueryKeys.team(teamId), 'opponents'] as const,
  squads: (teamId: string) => [...competitionsQueryKeys.team(teamId), 'squads'] as const,
  squad: (teamId: string, squadId: string) =>
    [...competitionsQueryKeys.squads(teamId), squadId] as const,
  eligibility: (teamId: string, squadId: string) =>
    [...competitionsQueryKeys.squad(teamId, squadId), 'eligibility'] as const,
  selections: (teamId: string, squadId: string) =>
    [...competitionsQueryKeys.squad(teamId, squadId), 'selections'] as const,
  availability: (teamId: string, squadId: string) =>
    [...competitionsQueryKeys.squad(teamId, squadId), 'availability'] as const,
  rosters: (teamId: string) => [...competitionsQueryKeys.team(teamId), 'rosters'] as const,
  roster: (teamId: string, rosterId: string) =>
    [...competitionsQueryKeys.rosters(teamId), rosterId] as const,
  rosterEntries: (teamId: string, rosterId: string) =>
    [...competitionsQueryKeys.roster(teamId, rosterId), 'entries'] as const,
  rosterValidation: (teamId: string, rosterId: string) =>
    [...competitionsQueryKeys.roster(teamId, rosterId), 'validation'] as const,
  rosterSnapshots: (teamId: string, rosterId: string) =>
    [...competitionsQueryKeys.roster(teamId, rosterId), 'snapshots'] as const,
};
