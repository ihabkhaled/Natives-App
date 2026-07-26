/**
 * NestJS analytics-module paths, relative to the versioned API base URL.
 * Every read model is team-scoped; the backend re-authorizes each call and
 * dual-gates the player series (team read, or self read of one's own
 * membership).
 */
function analyticsBasePath(teamId: string, suffix: string): string {
  return `/teams/${encodeURIComponent(teamId)}/analytics${suffix}`;
}

/** Chart-ready series for one player dimension. */
export function playerSeriesPath(teamId: string, subjectId: string): string {
  return analyticsBasePath(teamId, `/players/${encodeURIComponent(subjectId)}/series`);
}

/** Chart-ready series for one team dimension. */
export function teamSeriesPath(teamId: string): string {
  return analyticsBasePath(teamId, '/team/series');
}

/** Privacy-safe cohort comparison, suppressed below the sample threshold. */
export function cohortComparisonPath(teamId: string): string {
  return analyticsBasePath(teamId, '/cohorts/comparison');
}

/** Idempotent projection rebuild. */
export function rebuildAnalyticsPath(teamId: string): string {
  return analyticsBasePath(teamId, '/rebuild');
}
