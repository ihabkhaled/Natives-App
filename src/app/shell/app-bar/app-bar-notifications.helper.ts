import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { AppBarNotification } from './app-bar.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The inbox facts the bar previews, straight from the notifications module. */
export interface AppBarInbox {
  readonly unreadCount: number;
  readonly isLoading: boolean;
  readonly latest: readonly AppBarNotification[];
}

/** Every translated notifications field the app bar renders. */
export interface AppBarNotificationsView {
  readonly notificationsLabel: string;
  readonly notificationsEmptyTitle: string;
  readonly notificationsEmptyMessage: string;
  readonly notificationsPanelTitle: string;
  readonly notificationsBadgeLabel: string | null;
  readonly notificationsUnreadCount: number;
  readonly isNotificationsLoading: boolean;
  readonly notificationsLoadingLabel: string;
  readonly notificationsLatest: readonly AppBarNotification[];
  readonly notificationsViewAllLabel: string;
  readonly notificationsPreferencesLabel: string;
}

/**
 * The app bar's notifications copy and counters, built in one pure pass so the
 * hook stays a wiring list. A zero unread count produces no badge label at all
 * rather than the string "0": an empty inbox is not news.
 */
export function buildAppBarNotifications(
  t: Translate,
  inbox: AppBarInbox,
): AppBarNotificationsView {
  return {
    notificationsLabel: t(I18N_KEYS.appBar.notifications),
    notificationsEmptyTitle: t(I18N_KEYS.appBar.notificationsEmptyTitle),
    notificationsEmptyMessage: t(I18N_KEYS.appBar.notificationsEmptyMessage),
    notificationsPanelTitle: t(I18N_KEYS.appBar.notificationsPanelTitle),
    notificationsBadgeLabel:
      inbox.unreadCount === 0
        ? null
        : t(I18N_KEYS.appBar.notificationsUnreadBadge, { count: inbox.unreadCount }),
    notificationsUnreadCount: inbox.unreadCount,
    isNotificationsLoading: inbox.isLoading,
    notificationsLoadingLabel: t(I18N_KEYS.appBar.notificationsLoading),
    notificationsLatest: inbox.latest,
    notificationsViewAllLabel: t(I18N_KEYS.appBar.notificationsViewAll),
    notificationsPreferencesLabel: t(I18N_KEYS.appBar.notificationsPreferences),
  };
}
