export const authQueryKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authQueryKeys.all, 'current-user'] as const,
  invitation: (token: string) => [...authQueryKeys.all, 'invitation', token] as const,
  sessions: () => [...authQueryKeys.all, 'sessions'] as const,
  effectivePermissions: (teamId: string) =>
    [...authQueryKeys.all, 'effective-permissions', teamId] as const,
};
