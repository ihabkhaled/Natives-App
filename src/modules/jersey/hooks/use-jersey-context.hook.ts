import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

export interface JerseyContextView {
  readonly teamId: string;
  readonly isOffline: boolean;
  readonly canRead: boolean;
  readonly canManage: boolean;
  readonly isLoading: boolean;
}

/**
 * The team scope, grants, and connectivity the jersey screen needs.
 *
 * The two grants are not a formality here: `jersey.read` sees the orders — team
 * facts like reference, supplier and lifecycle state — while `jersey.manage`
 * is what opens one up, and an opened order lists the names and numbers being
 * printed on members' shirts. The backend enforces the same split; this only
 * keeps the client from offering a door it will be refused at.
 */
export function useJerseyContext(): JerseyContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();

  return {
    teamId: scope.teamId,
    isOffline: !network.isOnline,
    canRead: hasAllPermissions(permissions.permissions, [PERMISSIONS.jerseyRead]),
    canManage: hasAllPermissions(permissions.permissions, [PERMISSIONS.jerseyManage]),
    isLoading: scope.isLoading || permissions.isLoading,
  };
}
