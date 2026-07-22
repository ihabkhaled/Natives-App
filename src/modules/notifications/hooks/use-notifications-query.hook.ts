import { useSession } from '@/modules/auth';
import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildNotificationsQueryOptions } from '../queries/notifications.query';
import type { NotificationPage } from '../types/notifications.types';

/** One bounded window of the caller's inbox; idle until the session exists. */
export function useNotificationsQuery(limit: number): RemoteQueryView<NotificationPage> {
  const session = useSession();
  return toRemoteQueryView(
    useAppQuery<NotificationPage>(buildNotificationsQueryOptions(limit, session.isAuthenticated)),
  );
}
