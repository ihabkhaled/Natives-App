import { useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';

import { canManageNews } from '../helpers/news-permission.helper';

export interface NewsContextView {
  readonly isOffline: boolean;
  readonly isLoading: boolean;
  readonly canManage: boolean;
}

/**
 * Connectivity plus the one grant the newsroom cares about. Deliberately not
 * team-scoped: the public list and article routes are unauthenticated, so a
 * signed-out visitor resolves here with no grants and reads the news anyway.
 */
export function useNewsContext(): NewsContextView {
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();
  return {
    isOffline: !network.isOnline,
    isLoading: permissions.isLoading,
    canManage: canManageNews(permissions.permissions),
  };
}
