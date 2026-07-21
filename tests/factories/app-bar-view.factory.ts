import { vi } from 'vitest';

import type { AppBarView } from '@/app/shell/app-bar/app-bar.types';
import type { TeamSwitcherView } from '@/modules/auth';
import { APP_ICONS } from '@/packages/icons';
import { TEST_IDS } from '@/shared/config';

/** Deterministic team-switcher view; single-team by default, so it collapses. */
export function buildTeamSwitcherView(overrides: Partial<TeamSwitcherView> = {}): TeamSwitcherView {
  return {
    isAvailable: false,
    isOpen: false,
    label: 'Switch team',
    ariaLabel: 'Switch the team you are working in',
    activeTeamName: 'Ultimate Natives',
    activeTeamDetail: 'Season 2026',
    options: [],
    onToggle: vi.fn(),
    onSelect: vi.fn(),
    ...overrides,
  };
}

/** Deterministic app-bar view model shared by the container and component tests. */
export function buildAppBarView(overrides: Partial<AppBarView> = {}): AppBarView {
  return {
    isVisible: true,
    teamSwitcher: buildTeamSwitcherView(),
    ariaLabel: 'Page actions',
    title: 'Home',
    context: 'Ultimate Natives',
    themeToggleLabel: 'Switch to dark theme',
    isDark: false,
    onToggleTheme: vi.fn(),
    notificationsLabel: 'Notifications',
    isNotificationsOpen: false,
    onToggleNotifications: vi.fn(),
    notificationsEmptyTitle: 'You are all caught up',
    notificationsEmptyMessage: 'New practice and roster updates will land here.',
    notificationsPanelTitle: 'Latest notifications',
    notificationsBadgeLabel: null,
    notificationsUnreadCount: 0,
    isNotificationsLoading: false,
    notificationsLoadingLabel: 'Loading notifications…',
    notificationsLatest: [],
    notificationsViewAllLabel: 'View all notifications',
    notificationsPreferencesLabel: 'Notification preferences',
    onOpenNotification: vi.fn(),
    onViewAllNotifications: vi.fn(),
    onOpenNotificationPreferences: vi.fn(),
    userName: 'Ranger Rick',
    avatarLabel: 'Your profile',
    userMenuLabel: 'Account menu',
    isUserMenuOpen: false,
    onToggleUserMenu: vi.fn(),
    userMenuItems: [
      {
        key: 'settings',
        label: 'Settings',
        icon: APP_ICONS.settings,
        testId: TEST_IDS.appBarSettings,
        onSelect: vi.fn(),
      },
    ],
    ...overrides,
  };
}
