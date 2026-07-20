/**
 * NestJS points-module paths, relative to the versioned API base URL. Every
 * path is team-scoped and the backend re-authorizes the read on each call.
 */
function teamPath(teamId: string, suffix: string): string {
  return `/teams/${encodeURIComponent(teamId)}${suffix}`;
}

/** The team leaderboard, filtered by period / cohort / category. */
export function leaderboardPath(teamId: string): string {
  return teamPath(teamId, '/points');
}

/** The caller's own points summary: total, ledger, and awarded badges. */
export function myPointsPath(teamId: string): string {
  return teamPath(teamId, '/my-points');
}
