import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

export interface AnalyticsContextView {
  readonly teamId: string;
  readonly membershipId: string;
  readonly isOffline: boolean;
  readonly canReadTeam: boolean;
  readonly canReadSelf: boolean;
  readonly canRebuild: boolean;
  readonly isLoading: boolean;
}

/**
 * The team scope, effective grants, and connectivity both analytics screens
 * need. The rebuild affordance mirrors the backend's dual gate
 * (analytics.read.team + data_quality.manage); grants gate convenience UI
 * only — the backend re-authorizes every call.
 */
export function useAnalyticsContext(): AnalyticsContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const granted = permissions.permissions;
  const network = useNetworkStatus();
  return {
    teamId: scope.teamId,
    membershipId: scope.membershipId,
    isOffline: !network.isOnline,
    canReadTeam: hasAllPermissions(granted, [PERMISSIONS.analyticsReadTeam]),
    canReadSelf: hasAllPermissions(granted, [PERMISSIONS.analyticsReadSelf]),
    canRebuild: hasAllPermissions(granted, [
      PERMISSIONS.analyticsReadTeam,
      PERMISSIONS.dataQualityManage,
    ]),
    isLoading: scope.isLoading || permissions.isLoading,
  };
}
