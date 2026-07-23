export const authQueryKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authQueryKeys.all, 'current-user'] as const,
  invitation: (token: string) => [...authQueryKeys.all, 'invitation', token] as const,
  sessions: () => [...authQueryKeys.all, 'sessions'] as const,
  /** Prefix for every scope — invalidated whole after acceptance grants a role. */
  effectivePermissionsRoot: () => [...authQueryKeys.all, 'effective-permissions'] as const,
  effectivePermissions: (teamId: string) =>
    [...authQueryKeys.effectivePermissionsRoot(), teamId] as const,
};
