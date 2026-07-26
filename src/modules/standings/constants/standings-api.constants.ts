/**
 * NestJS standings-module paths, relative to the versioned API base URL.
 * Standings, rules, achievements, and the trophy cabinet are all team-scoped
 * and the backend re-authorizes every call.
 */
function standingsTeamPath(teamId: string, suffix: string): string {
  return `/teams/${encodeURIComponent(teamId)}${suffix}`;
}

/** The competition standings table read. */
export function standingsPath(teamId: string): string {
  return standingsTeamPath(teamId, '/standings');
}

/** Derive a competition's table from finalized matches. */
export function standingsRecomputePath(teamId: string): string {
  return standingsTeamPath(teamId, '/standings/recompute');
}

/** Record an external or historical row with its reconciliation note. */
export function standingsManualPath(teamId: string): string {
  return standingsTeamPath(teamId, '/standings/manual');
}

/** Versioned, immutable point rules: list and publish-next-version. */
export function standingsRulesPath(teamId: string): string {
  return standingsTeamPath(teamId, '/standings-rules');
}

/** The achievements workspace list/create. */
export function achievementsPath(teamId: string): string {
  return standingsTeamPath(teamId, '/achievements');
}

/** One achievement claim. */
export function achievementPath(teamId: string, achievementId: string): string {
  return standingsTeamPath(teamId, `/achievements/${encodeURIComponent(achievementId)}`);
}

/** The approval state machine endpoint for one claim. */
export function achievementTransitionPath(teamId: string, achievementId: string): string {
  return standingsTeamPath(teamId, `/achievements/${encodeURIComponent(achievementId)}/transition`);
}

/** The audited, dry-run-first historical import. */
export function achievementImportPath(teamId: string): string {
  return standingsTeamPath(teamId, '/achievements/import');
}

/** The trophy cabinet: approved, non-staff achievements only. */
export function teamHistoryPath(teamId: string): string {
  return standingsTeamPath(teamId, '/history');
}
