import { formatCairoDateTime } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';

import { NOTIFICATION_LIMITS } from '../constants/notifications.constants';
import { countUnread } from '../helpers/notification-group.helper';
import { buildNotificationRow } from '../helpers/notification-row.helper';
import type { NotificationRowView } from '../types/notifications-view.types';
import { useNotificationsQuery } from './use-notifications-query.hook';

export interface UnreadNotificationsView {
  readonly unreadCount: number;
  readonly isLoading: boolean;
  readonly latest: readonly NotificationRowView[];
}

/**
 * The app bar's read model: how many unread entries the first bounded page
 * holds, plus the few most recent rows the popover previews. It reuses the
 * inbox query, so opening the popover costs no extra request.
 */
export function useUnreadNotifications(): UnreadNotificationsView {
  const { t, locale } = useAppTranslation();
  const query = useNotificationsQuery(NOTIFICATION_LIMITS.pageSize);
  const items = query.data?.items ?? [];
  return {
    unreadCount: countUnread(items),
    isLoading: query.isLoading,
    latest: items
      .slice(0, 4)
      .map((item) =>
        buildNotificationRow(t, (iso: string) => formatCairoDateTime(iso, locale), item),
      ),
  };
}
