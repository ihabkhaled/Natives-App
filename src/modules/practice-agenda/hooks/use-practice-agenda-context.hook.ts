import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

export interface PracticeAgendaContextView {
  readonly teamId: string;
  readonly isOffline: boolean;
  /** `practice.read` — enough to see the plan a coach published. */
  readonly canRead: boolean;
  /** `practice.manage` — the grant that lets the plan be changed. */
  readonly canManage: boolean;
  readonly isLoading: boolean;
}

/**
 * The team scope, grants, and connectivity the plan needs.
 *
 * Reading and planning are two grants here, unlike the single-grant screens:
 * a member may legitimately read the agenda for a session they are attending
 * while only a coach may reorder it. The backend re-authorizes every call.
 */
export function usePracticeAgendaContext(): PracticeAgendaContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();

  return {
    teamId: scope.teamId,
    isOffline: !network.isOnline,
    canRead: hasAllPermissions(permissions.permissions, [PERMISSIONS.practicesRead]),
    canManage: hasAllPermissions(permissions.permissions, [PERMISSIONS.practicesManage]),
    isLoading: scope.isLoading || permissions.isLoading,
  };
}
