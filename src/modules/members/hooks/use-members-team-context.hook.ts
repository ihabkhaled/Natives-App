import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

export interface MembersTeamContextView {
  readonly teamId: string;
  readonly teamName: string;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly permissions: readonly string[];
  readonly canInvite: boolean;
  readonly canManageLifecycle: boolean;
  readonly canManageRoles: boolean;
  readonly canManageAliases: boolean;
  readonly canEditSelf: boolean;
}

/**
 * The authenticated member's team scope plus their effective member grants.
 * The scope follows the team the principal switched to, not whichever
 * membership the identity endpoint happened to list first.
 */
export function useMembersTeamContext(): MembersTeamContextView {
  const scope = useActiveTeamScope();
  const effective = useEffectivePermissions();
  const permissions = effective.permissions;
  return {
    teamId: scope.teamId,
    teamName: scope.teamName,
    isLoading: scope.isLoading,
    isError: scope.isError,
    permissions,
    canInvite: hasAllPermissions(permissions, [PERMISSIONS.memberInvite]),
    canManageLifecycle: hasAllPermissions(permissions, [PERMISSIONS.memberLifecycleManage]),
    canManageRoles: hasAllPermissions(permissions, [PERMISSIONS.memberRolesManage]),
    canManageAliases: hasAllPermissions(permissions, [PERMISSIONS.memberAliasesManage]),
    canEditSelf: hasAllPermissions(permissions, [PERMISSIONS.memberProfileUpdateSelf]),
  };
}
