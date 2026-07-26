import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

export interface StandingsContextView {
  readonly teamId: string;
  readonly membershipId: string;
  readonly isOffline: boolean;
  readonly canRead: boolean;
  readonly canManage: boolean;
  readonly canImport: boolean;
  readonly canReadHistory: boolean;
  readonly isLoading: boolean;
}

/**
 * The team scope, effective grants, and connectivity every standings screen
 * needs. Grants gate convenience UI only; the backend re-authorizes each call.
 */
export function useStandingsContext(): StandingsContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const granted = permissions.permissions;
  const network = useNetworkStatus();
  return {
    teamId: scope.teamId,
    membershipId: scope.membershipId,
    isOffline: !network.isOnline,
    canRead: hasAllPermissions(granted, [PERMISSIONS.competitionRead]),
    canManage: hasAllPermissions(granted, [PERMISSIONS.competitionManage]),
    canImport: hasAllPermissions(granted, [
      PERMISSIONS.competitionManage,
      PERMISSIONS.importManage,
    ]),
    canReadHistory: hasAllPermissions(granted, [PERMISSIONS.teamRead]),
    isLoading: scope.isLoading || permissions.isLoading,
  };
}
