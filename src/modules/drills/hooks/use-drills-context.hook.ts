import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

export interface DrillsContextView {
  readonly teamId: string;
  readonly isOffline: boolean;
  readonly isLoading: boolean;
  readonly canManage: boolean;
}

/**
 * The team scope, connectivity, and the one grant every drill screen needs.
 * Gates convenience UI only; the backend re-authorizes every read and write.
 */
export function useDrillsContext(): DrillsContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();
  return {
    teamId: scope.teamId,
    isOffline: !network.isOnline,
    isLoading: scope.isLoading || permissions.isLoading,
    canManage: hasAllPermissions(permissions.permissions, [PERMISSIONS.drillManage]),
  };
}
