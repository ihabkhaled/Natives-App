/**
 * Stable query-key builders for the role-assignments cache.
 *
 * The tree is rooted on the module rather than on a team, because an
 * assignment list is per-USER and spans every scope that user holds. A grant
 * or a revoke invalidates `all`, so the assignable-roles catalog is re-read
 * too: changing your own access can change what you may hand on next.
 */
export const roleAssignmentsQueryKeys = {
  all: ['role-assignments'] as const,
  user: (userId: string) => [...roleAssignmentsQueryKeys.all, 'user', userId] as const,
  assignableRoles: (teamId: string) =>
    [...roleAssignmentsQueryKeys.all, 'assignable-roles', teamId] as const,
};
