import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

export interface RoleAssignmentsContextView {
  readonly teamId: string;
  readonly seasonId: string | null;
  readonly isOffline: boolean;
  readonly canManage: boolean;
  readonly isLoading: boolean;
}

/**
 * The scope, grants, and connectivity this screen reasons about.
 *
 * `member.roles.manage` is the single grant: reading who holds what and
 * changing it are the same privilege, because the list is only useful to
 * someone who could act on it. The backend re-authorizes every call and
 * enforces its own ceiling on top — this flag decides what to RENDER, never
 * what is allowed.
 */
export function useRoleAssignmentsContext(): RoleAssignmentsContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();

  return {
    teamId: scope.teamId,
    seasonId: scope.seasonId,
    isOffline: !network.isOnline,
    canManage: hasAllPermissions(permissions.permissions, [PERMISSIONS.memberRolesManage]),
    isLoading: scope.isLoading || permissions.isLoading,
  };
}
