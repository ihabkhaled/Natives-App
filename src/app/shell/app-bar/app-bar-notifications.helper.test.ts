import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { buildAppBarNotifications } from './app-bar-notifications.helper';

const t = (key: string): string => key;

const ROW = {
  id: 'n-1',
  title: 'Practice moved',
  receivedLabel: 'an hour ago',
  isUnread: true,
};

describe('buildAppBarNotifications', () => {
  it('carries the previewed rows straight through', () => {
    const view = buildAppBarNotifications(t, { unreadCount: 1, isLoading: false, latest: [ROW] });

    expect(view.notificationsLatest).toEqual([ROW]);
    expect(view.notificationsUnreadCount).toBe(1);
  });

  it('shows no badge at all for an empty inbox: zero is not news', () => {
    const view = buildAppBarNotifications(t, { unreadCount: 0, isLoading: false, latest: [] });

    expect(view.notificationsBadgeLabel).toBeNull();
  });

  it('labels the badge once there is something unread', () => {
    const view = buildAppBarNotifications(t, { unreadCount: 3, isLoading: false, latest: [] });

    expect(view.notificationsBadgeLabel).toBe(I18N_KEYS.appBar.notificationsUnreadBadge);
  });

  it('passes the loading flag through for the panel skeleton', () => {
    expect(
      buildAppBarNotifications(t, { unreadCount: 0, isLoading: true, latest: [] })
        .isNotificationsLoading,
    ).toBe(true);
  });

  it('resolves every fixed label once', () => {
    const view = buildAppBarNotifications(t, { unreadCount: 0, isLoading: false, latest: [] });

    expect(view.notificationsPanelTitle).toBe(I18N_KEYS.appBar.notificationsPanelTitle);
    expect(view.notificationsViewAllLabel).toBe(I18N_KEYS.appBar.notificationsViewAll);
    expect(view.notificationsPreferencesLabel).toBe(I18N_KEYS.appBar.notificationsPreferences);
  });
});
