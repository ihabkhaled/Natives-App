import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildNotificationsQueryOptions } from '../queries/notifications.query';
import type { NotificationPage } from '../types/notifications.types';

/** One bounded window of the caller's inbox. */
export function useNotificationsQuery(limit: number): RemoteQueryView<NotificationPage> {
  return toRemoteQueryView(useAppQuery<NotificationPage>(buildNotificationsQueryOptions(limit)));
}
