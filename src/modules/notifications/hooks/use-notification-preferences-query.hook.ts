import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildNotificationPreferencesQueryOptions } from '../queries/notifications.query';
import type { NotificationPreferences } from '../types/notifications.types';

/** The caller's category/channel preference matrix. */
export function useNotificationPreferencesQuery(): RemoteQueryView<NotificationPreferences> {
  return toRemoteQueryView(
    useAppQuery<NotificationPreferences>(buildNotificationPreferencesQueryOptions()),
  );
}
