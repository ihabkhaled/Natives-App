/**
 * NestJS reports-module paths, relative to the versioned API base URL. Every
 * job is team-scoped; downloads mint a fresh signed URL per call and are
 * audited server-side — the artifact never streams through the API.
 */
function reportsBasePath(teamId: string, suffix: string): string {
  return `/teams/${encodeURIComponent(teamId)}/reports${suffix}`;
}

/** The job list (and the POST that requests a new job). */
export function reportsPath(teamId: string): string {
  return reportsBasePath(teamId, '');
}

/** One job row, for a deep-linkable refresh. */
export function reportJobPath(teamId: string, jobId: string): string {
  return reportsBasePath(teamId, `/${encodeURIComponent(jobId)}`);
}

/** Mint a short-lived signed download URL (each mint is audited). */
export function reportDownloadPath(teamId: string, jobId: string): string {
  return reportsBasePath(teamId, `/${encodeURIComponent(jobId)}/download`);
}

/** Retry a failed job within its attempt budget. */
export function reportRetryPath(teamId: string, jobId: string): string {
  return reportsBasePath(teamId, `/${encodeURIComponent(jobId)}/retry`);
}
