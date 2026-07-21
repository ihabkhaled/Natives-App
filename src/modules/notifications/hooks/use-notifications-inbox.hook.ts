import { adminOperationsPath } from '@/modules/admin';
import { formatCairoDateTime, nowIso } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { NOTIFICATION_LIMITS } from '../constants/notifications.constants';
import { buildInboxLabels } from '../helpers/inbox-labels.helper';
import {
  countUnread,
  filterNotifications,
  groupNotifications,
} from '../helpers/notification-group.helper';
import { buildNotificationGroups } from '../helpers/notification-row.helper';
import {
  buildNotificationsScreenCopy,
  resolveNotificationsScreenStatus,
} from '../helpers/notifications-copy.helper';
import { useMarkReadMutation } from '../mutations/use-mark-read-mutation.hook';
import {
  notificationLinkPath,
  notificationPreferencesPagePath,
} from '../routes/notifications.paths';
import type { NotificationsInboxView } from '../types/notifications-view.types';
import { useInboxFilters } from './use-inbox-filters.hook';
import { useNotificationsContext } from './use-notifications-context.hook';
import { useNotificationsQuery } from './use-notifications-query.hook';

/**
 * Prepared, translated view model for the inbox. The list is bounded twice
 * over: the API window the query asks for, and the ceiling `useInboxFilters`
 * refuses to grow past. Opening a row never navigates straight to the target
 * — it routes through the link screen, which re-checks authorization first.
 */
export function useNotificationsInbox(): NotificationsInboxView {
  const { t, locale } = useAppTranslation();
  const context = useNotificationsContext();
  const navigation = useAppNavigation();
  const toast = useAppToast();
  const filters = useInboxFilters();
  const query = useNotificationsQuery(filters.limit);
  const markRead = useMarkReadMutation({
    onSuccess: () => {
      void toast.showToast({
        message: t(I18N_KEYS.notifications.markedReadToast),
        tone: 'success',
      });
    },
    onError: () => {
      void toast.showToast({
        message: t(I18N_KEYS.notifications.markReadFailedToast),
        tone: 'danger',
      });
    },
  });

  const loaded = query.data?.items ?? [];
  const matches = filterNotifications(loaded, filters);
  const unread = countUnread(loaded);

  return {
    ...buildNotificationsScreenCopy(t, {
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: I18N_KEYS.notifications.emptyTitle,
      emptyMessageKey: I18N_KEYS.notifications.emptyMessage,
    }),
    ...buildInboxLabels(t, {
      unread,
      shown: matches.length,
      total: query.data?.total ?? matches.length,
      canReadDeliveryFailures: context.canReadDeliveryFailures,
    }),
    status: resolveNotificationsScreenStatus(context, query, true, loaded.length > 0),
    canMarkAll: unread > 0 && !markRead.isRunning,
    statusFilter: filters.status,
    categoryFilter: filters.category,
    hasMatches: matches.length > 0,
    groups: buildNotificationGroups(
      t,
      (iso: string) => formatCairoDateTime(iso, locale),
      groupNotifications(matches, nowIso()),
    ),
    canLoadMore: filters.limit < NOTIFICATION_LIMITS.maxItems && loaded.length >= filters.limit,
    onStatusFilterChange: filters.setStatus,
    onCategoryFilterChange: filters.setCategory,
    onOpen: (notificationId: string) => {
      navigation.push(notificationLinkPath(notificationId));
    },
    onMarkRead: markRead.run,
    onMarkAllRead: () => {
      for (const item of loaded.filter((entry) => entry.readAt === null)) {
        markRead.run(item.id);
      }
    },
    onLoadMore: filters.growWindow,
    onOpenDeliveryCentre: () => {
      navigation.push(adminOperationsPath());
    },
    onOpenPreferences: () => {
      navigation.push(notificationPreferencesPagePath());
    },
  };
}
