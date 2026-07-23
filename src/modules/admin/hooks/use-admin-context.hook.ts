import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { PERMISSIONS } from '@/shared/security';

import type { AdminContextView } from '../types/admin-view.types';

/**
 * The team scope, effective grants, and connectivity every admin screen
 * needs. Each capability is resolved once here so a screen never reasons
 * about permission strings itself — and the backend re-authorizes regardless.
 */
export function useAdminContext(): AdminContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();
  const granted = permissions.permissions;
  return {
    teamId: scope.teamId,
    membershipId: scope.membershipId,
    isOffline: !network.isOnline,
    canReadSettings:
      granted.includes(PERMISSIONS.settingsRead) || granted.includes(PERMISSIONS.settingsManage),
    canManageSettings: granted.includes(PERMISSIONS.settingsManage),
    canManageRoles: granted.includes(PERMISSIONS.memberRolesManage),
    canManageRules:
      granted.includes(PERMISSIONS.pointsRuleManage) ||
      granted.includes(PERMISSIONS.calculationRuleManage),
    canReadAudit: granted.includes(PERMISSIONS.auditRead),
    canManageOutbox: granted.includes(PERMISSIONS.outboxManage),
    canManagePlatform: granted.includes(PERMISSIONS.platformAdmin),
    isLoading: scope.isLoading || permissions.isLoading,
  };
}
