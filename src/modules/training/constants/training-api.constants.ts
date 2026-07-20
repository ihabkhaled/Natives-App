/**
 * NestJS activities-module paths, relative to the versioned API base URL.
 * Every path is team-scoped: the backend re-authorizes team membership,
 * ownership, and reviewer privilege on each call.
 */
function teamPath(teamId: string, suffix: string): string {
  return `/teams/${encodeURIComponent(teamId)}${suffix}`;
}

export function activityTypesPath(teamId: string): string {
  return teamPath(teamId, '/activity-types');
}

export function submissionsPath(teamId: string): string {
  return teamPath(teamId, '/activity-submissions');
}

export function submissionPath(teamId: string, submissionId: string): string {
  return `${submissionsPath(teamId)}/${encodeURIComponent(submissionId)}`;
}

export function submissionSubmitPath(teamId: string, submissionId: string): string {
  return `${submissionPath(teamId, submissionId)}/submit`;
}

export function submissionWithdrawPath(teamId: string, submissionId: string): string {
  return `${submissionPath(teamId, submissionId)}/withdraw`;
}

export function submissionEvidencePath(teamId: string, submissionId: string): string {
  return `${submissionPath(teamId, submissionId)}/evidence`;
}

export function reviewQueuePath(teamId: string): string {
  return teamPath(teamId, '/activity-review');
}

export function reviewDetailPath(teamId: string, submissionId: string): string {
  return `${reviewQueuePath(teamId)}/${encodeURIComponent(submissionId)}`;
}

export function reviewDecisionPath(teamId: string, submissionId: string, decision: string): string {
  return `${reviewDetailPath(teamId, submissionId)}/${decision}`;
}
