import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

export interface TryoutCandidatesContextView {
  readonly teamId: string;
  readonly isOffline: boolean;
  readonly canManage: boolean;
  readonly canReadContacts: boolean;
  readonly canReadReadiness: boolean;
  readonly isLoading: boolean;
}

/**
 * Team scope, grants, and connectivity for the candidate review screen.
 *
 * Three grants, not one. `tryout.manage` opens the screen; the contact and
 * readiness details each need their own read grant on top, exactly as the
 * backend gates them. Holding the client-side grant is necessary but never
 * sufficient — the server still decides what it sends, and the disclosure
 * helpers require both to agree.
 */
export function useTryoutCandidatesContext(): TryoutCandidatesContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();

  return {
    teamId: scope.teamId,
    isOffline: !network.isOnline,
    canManage: hasAllPermissions(permissions.permissions, [PERMISSIONS.tryoutManage]),
    canReadContacts: hasAllPermissions(permissions.permissions, [PERMISSIONS.tryoutContactsRead]),
    canReadReadiness: hasAllPermissions(permissions.permissions, [PERMISSIONS.tryoutReadinessRead]),
    isLoading: scope.isLoading || permissions.isLoading,
  };
}
