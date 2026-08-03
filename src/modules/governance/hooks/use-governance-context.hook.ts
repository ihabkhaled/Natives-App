import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

export interface GovernanceContextView {
  readonly teamId: string;
  readonly isOffline: boolean;
  readonly canRead: boolean;
  readonly isLoading: boolean;
}

/**
 * The team scope, grants, and connectivity the governance screen needs.
 * Reading is `governance.read`; the server additionally filters each record by
 * its own visibility, so holding the grant is not the same as seeing
 * everything.
 */
export function useGovernanceContext(): GovernanceContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();

  return {
    teamId: scope.teamId,
    isOffline: !network.isOnline,
    canRead: hasAllPermissions(permissions.permissions, [PERMISSIONS.governanceRead]),
    isLoading: scope.isLoading || permissions.isLoading,
  };
}
