/**
 * NestJS competitions-module paths, relative to the versioned API base URL.
 * Every path is team-scoped: the backend re-authorizes team membership,
 * season scope, and the selection/override grants on each call.
 */
function teamPath(teamId: string, suffix: string): string {
  return `/teams/${encodeURIComponent(teamId)}${suffix}`;
}

export function competitionsPath(teamId: string): string {
  return teamPath(teamId, '/competitions');
}

export function competitionPath(teamId: string, competitionId: string): string {
  return `${competitionsPath(teamId)}/${encodeURIComponent(competitionId)}`;
}

export function competitionStructurePath(teamId: string, competitionId: string): string {
  return `${competitionPath(teamId, competitionId)}/structure`;
}

export function competitionFixturesPath(teamId: string, competitionId: string): string {
  return `${competitionPath(teamId, competitionId)}/fixtures`;
}

export function opponentsPath(teamId: string): string {
  return teamPath(teamId, '/opponents');
}

export function squadsPath(teamId: string): string {
  return teamPath(teamId, '/squads');
}

export function squadPath(teamId: string, squadId: string): string {
  return `${squadsPath(teamId)}/${encodeURIComponent(squadId)}`;
}

export function squadEligibilityPath(teamId: string, squadId: string): string {
  return `${squadPath(teamId, squadId)}/eligibility`;
}

export function squadSelectionsPath(teamId: string, squadId: string): string {
  return `${squadPath(teamId, squadId)}/selections`;
}

export function squadSelectionOverridePath(teamId: string, squadId: string): string {
  return `${squadSelectionsPath(teamId, squadId)}/override`;
}

export function squadSelectionRemovalPath(
  teamId: string,
  squadId: string,
  membershipId: string,
): string {
  return `${squadSelectionsPath(teamId, squadId)}/${encodeURIComponent(membershipId)}/removal`;
}

export function squadAvailabilityPath(teamId: string, squadId: string): string {
  return `${squadPath(teamId, squadId)}/availability`;
}

export function squadTransitionPath(teamId: string, squadId: string): string {
  return `${squadPath(teamId, squadId)}/transition`;
}

export function rostersPath(teamId: string): string {
  return teamPath(teamId, '/rosters');
}

export function rosterPath(teamId: string, rosterId: string): string {
  return `${rostersPath(teamId)}/${encodeURIComponent(rosterId)}`;
}

export function rosterEntriesPath(teamId: string, rosterId: string): string {
  return `${rosterPath(teamId, rosterId)}/entries`;
}

export function rosterEntryRemovalPath(
  teamId: string,
  rosterId: string,
  membershipId: string,
): string {
  return `${rosterEntriesPath(teamId, rosterId)}/${encodeURIComponent(membershipId)}/removal`;
}

export function rosterValidationPath(teamId: string, rosterId: string): string {
  return `${rosterPath(teamId, rosterId)}/validation`;
}

export function rosterSnapshotsPath(teamId: string, rosterId: string): string {
  return `${rosterPath(teamId, rosterId)}/snapshots`;
}

export function rosterLockPath(teamId: string, rosterId: string): string {
  return `${rosterPath(teamId, rosterId)}/lock`;
}

export function rosterTransitionPath(teamId: string, rosterId: string): string {
  return `${rosterPath(teamId, rosterId)}/transition`;
}
