import type { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';

/**
 * The two auth payloads every protected screen's hook spec needs.
 *
 * The `vi.mock` factory itself cannot live here — vitest hoists it to the top
 * of the file that declares it — but the payloads can, and repeating them was
 * the single largest source of duplication across the module specs.
 */
export function buildTeamScope(
  overrides: Partial<ReturnType<typeof useActiveTeamScope>> = {},
): ReturnType<typeof useActiveTeamScope> {
  return {
    teamId: 'team-1',
    membershipId: 'membership-1',
    seasonId: null,
    teamName: 'Cairo Natives',
    isLoading: false,
    isError: false,
    ...overrides,
  };
}

/** Effective grants for an active, onboarded principal holding `permissions`. */
export function buildEffectivePermissions(
  permissions: readonly string[],
  isLoading = false,
): ReturnType<typeof useEffectivePermissions> {
  return {
    permissions,
    accountActive: true,
    accountPending: false,
    onboardingComplete: true,
    hasTeamContext: true,
    isLoading,
    isError: false,
  };
}
