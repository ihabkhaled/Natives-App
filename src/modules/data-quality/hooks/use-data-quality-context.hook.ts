import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

export interface DataQualityContextView {
  readonly teamId: string;
  readonly isOffline: boolean;
  readonly canManage: boolean;
  readonly isLoading: boolean;
}

/**
 * The team scope, effective grants, and connectivity the operations queue
 * needs. Reviewing and repairing are one grant — `data_quality.manage` — so
 * there is no read-only variant to model. The backend re-authorizes every call.
 */
export function useDataQualityContext(): DataQualityContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();

  return {
    teamId: scope.teamId,
    isOffline: !network.isOnline,
    canManage: hasAllPermissions(permissions.permissions, [PERMISSIONS.dataQualityManage]),
    isLoading: scope.isLoading || permissions.isLoading,
  };
}
