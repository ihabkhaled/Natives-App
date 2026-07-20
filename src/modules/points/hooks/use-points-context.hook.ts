import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

export interface PointsContextView {
  readonly teamId: string;
  readonly membershipId: string;
  readonly isOffline: boolean;
  readonly canReadLeaderboard: boolean;
  readonly canReadOwnPoints: boolean;
  readonly isLoading: boolean;
}

/**
 * The team scope, effective grants, and connectivity both points screens
 * need. Grants gate convenience UI only; the backend re-authorizes each read.
 */
export function usePointsContext(): PointsContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();
  return {
    teamId: scope.teamId,
    membershipId: scope.membershipId,
    isOffline: !network.isOnline,
    canReadLeaderboard: hasAllPermissions(permissions.permissions, [PERMISSIONS.leaderboardsRead]),
    canReadOwnPoints: hasAllPermissions(permissions.permissions, [PERMISSIONS.pointsReadSelf]),
    isLoading: scope.isLoading || permissions.isLoading,
  };
}
