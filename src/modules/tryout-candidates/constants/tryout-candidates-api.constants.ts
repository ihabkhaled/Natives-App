/**
 * Tryout-candidate paths, relative to the versioned API base URL. These are
 * team-scoped and flat: a candidate is addressed by team and candidate id, not
 * through the event they registered for.
 */
function candidatesPath(teamId: string): string {
  return `/teams/${encodeURIComponent(teamId)}/tryout-candidates`;
}

export function tryoutCandidatesPath(teamId: string): string {
  return candidatesPath(teamId);
}

export function tryoutCandidatePath(teamId: string, candidateId: string): string {
  return `${candidatesPath(teamId)}/${encodeURIComponent(candidateId)}`;
}

export function tryoutCandidateWithdrawalPath(teamId: string, candidateId: string): string {
  return `${tryoutCandidatePath(teamId, candidateId)}/withdrawal`;
}

export function tryoutCandidateRetentionPath(teamId: string): string {
  return `${candidatesPath(teamId)}/retention`;
}
