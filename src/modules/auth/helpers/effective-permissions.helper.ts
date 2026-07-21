/**
 * Merge the globally-granted permissions from `/auth/me` with the team-scoped
 * ones from `/rbac/me/permissions?teamId=`.
 *
 * Neither set is a superset of the other in principle: a super administrator's
 * platform grants arrive globally, while a team administrator's arrive only in
 * scope. Taking the union is what lets one shell serve both without a role
 * check anywhere in the UI. Sorted so the result is stable for comparison.
 */
export function mergePermissionSets(
  global: readonly string[],
  scoped: readonly string[],
): readonly string[] {
  return [...new Set([...global, ...scoped])].sort((left, right) => left.localeCompare(right));
}
