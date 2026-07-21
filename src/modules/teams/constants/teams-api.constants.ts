/**
 * Team and season endpoints, relative to the versioned API base URL.
 *
 * `/teams` is a PLATFORM route: with no `:teamId` in the path there is nothing
 * for a team-scoped grant to attach to, so only a global grant satisfies it.
 * `/teams/mine` is the team-scoped equivalent an ordinary member may call.
 * Lifecycle moves are their own verbs, never a status field on PATCH.
 */
const TEAMS_ROOT = '/teams';

export function teamsPath(): string {
  return TEAMS_ROOT;
}

/** The caller's own teams; satisfied by a team-scoped grant. */
export function myTeamsPath(): string {
  return `${TEAMS_ROOT}/mine`;
}

export function teamPath(teamId: string): string {
  return `${TEAMS_ROOT}/${encodeURIComponent(teamId)}`;
}

export function teamTransitionPath(teamId: string, transition: string): string {
  return `${teamPath(teamId)}/${transition}`;
}

export function seasonsPath(teamId: string): string {
  return `${teamPath(teamId)}/seasons`;
}

/** The season covering today, or a 404 the caller must state rather than guess. */
export function currentSeasonPath(teamId: string): string {
  return `${seasonsPath(teamId)}/current`;
}

export function seasonPath(teamId: string, seasonId: string): string {
  return `${seasonsPath(teamId)}/${encodeURIComponent(seasonId)}`;
}

export function seasonTransitionPath(teamId: string, seasonId: string, transition: string): string {
  return `${seasonPath(teamId, seasonId)}/${transition}`;
}

/** The seeded role x permission matrix, scoped so a team admin's grant covers it. */
export function roleMatrixPath(): string {
  return '/rbac/role-bundles';
}
