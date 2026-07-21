import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { PERMISSIONS } from '@/shared/security';

import type { NotificationsContextView } from '../types/notifications-view.types';

/**
 * The scope, grants, and connectivity every notification screen needs. The
 * inbox itself needs no grant — it is the caller's own — but delivery
 * *failures* are administrative and gated on their own permission.
 */
export function useNotificationsContext(): NotificationsContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();
  return {
    teamName: scope.teamName,
    isOffline: !network.isOnline,
    canReadDeliveryFailures: permissions.permissions.includes(PERMISSIONS.outboxManage),
    isLoading: permissions.isLoading,
  };
}
