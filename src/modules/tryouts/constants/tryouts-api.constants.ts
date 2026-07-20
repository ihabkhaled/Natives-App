/**
 * Tryout paths, relative to the versioned API base URL. The public
 * registration endpoints are unauthenticated by design; every staff path is
 * team-scoped and re-authorized by the backend once the module ships.
 */
function teamPath(teamId: string, suffix: string): string {
  return `/teams/${encodeURIComponent(teamId)}${suffix}`;
}

export function publicTryoutEventsPath(): string {
  return '/public/tryout-events';
}

export function publicTryoutRegistrationsPath(): string {
  return '/public/tryout-registrations';
}

export function tryoutsPath(teamId: string): string {
  return teamPath(teamId, '/tryouts');
}

export function tryoutPath(teamId: string, tryoutId: string): string {
  return `${tryoutsPath(teamId)}/${encodeURIComponent(tryoutId)}`;
}

export function tryoutCandidatesPath(teamId: string, tryoutId: string): string {
  return `${tryoutPath(teamId, tryoutId)}/candidates`;
}

export function tryoutCandidatePath(teamId: string, tryoutId: string, candidateId: string): string {
  return `${tryoutCandidatesPath(teamId, tryoutId)}/${encodeURIComponent(candidateId)}`;
}

export function tryoutCheckInPath(teamId: string, tryoutId: string, candidateId: string): string {
  return `${tryoutCandidatePath(teamId, tryoutId, candidateId)}/check-in`;
}

export function tryoutEvaluationsPath(
  teamId: string,
  tryoutId: string,
  candidateId: string,
): string {
  return `${tryoutCandidatePath(teamId, tryoutId, candidateId)}/evaluations`;
}

export function tryoutDecisionPath(teamId: string, tryoutId: string, candidateId: string): string {
  return `${tryoutCandidatePath(teamId, tryoutId, candidateId)}/decision`;
}

export function tryoutConversionPath(
  teamId: string,
  tryoutId: string,
  candidateId: string,
): string {
  return `${tryoutCandidatePath(teamId, tryoutId, candidateId)}/conversion`;
}
