/**
 * RBAC assignment paths, relative to the versioned API base URL.
 *
 * The grant/revoke pair is deliberately NOT team-scoped in its URL: the server
 * derives the scope from the query string and re-checks the actor's ceiling
 * against it, so a client that guessed a scope cannot smuggle one through.
 */
export function userAssignmentsPath(userId: string): string {
  return `/rbac/users/${encodeURIComponent(userId)}/assignments`;
}

export function roleAssignmentsPath(): string {
  return '/rbac/assignments';
}

/** One assignment, addressed by its own id — the only handle revoke takes. */
export function roleAssignmentPath(assignmentId: string): string {
  return `${roleAssignmentsPath()}/${encodeURIComponent(assignmentId)}`;
}

/**
 * The roles the acting principal may grant in this team, as the SERVER
 * computes them from its own privilege ceiling. `src/modules/members` reads
 * the same route for its invite form; this module reads it again rather than
 * deep-importing across a module boundary (see README, "Shared with members").
 */
export function assignableRolesPath(teamId: string): string {
  return `/rbac/teams/${encodeURIComponent(teamId)}/assignable-roles`;
}
