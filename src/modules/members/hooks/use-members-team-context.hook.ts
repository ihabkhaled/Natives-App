import { useCurrentUserQuery, useEffectivePermissions } from '@/modules/auth';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

export interface MembersTeamContextView {
  readonly teamId: string;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly permissions: readonly string[];
  readonly canInvite: boolean;
  readonly canManageLifecycle: boolean;
  readonly canManageRoles: boolean;
  readonly canManageAliases: boolean;
  readonly canEditSelf: boolean;
}

/** The authenticated member's team scope plus their effective member grants. */
export function useMembersTeamContext(): MembersTeamContextView {
  const currentUser = useCurrentUserQuery();
  const effective = useEffectivePermissions();
  const permissions = effective.permissions;
  return {
    teamId: currentUser.user?.memberships[0]?.teamId ?? '',
    isLoading: currentUser.isLoading,
    isError: currentUser.isError,
    permissions,
    canInvite: hasAllPermissions(permissions, [PERMISSIONS.memberInvite]),
    canManageLifecycle: hasAllPermissions(permissions, [PERMISSIONS.memberLifecycleManage]),
    canManageRoles: hasAllPermissions(permissions, [PERMISSIONS.memberRolesManage]),
    canManageAliases: hasAllPermissions(permissions, [PERMISSIONS.memberAliasesManage]),
    canEditSelf: hasAllPermissions(permissions, [PERMISSIONS.memberProfileUpdateSelf]),
  };
}
