import type { TeamSwitcherView } from '@/modules/auth';

/** One entry of the avatar account menu. */
interface AppBarMenuItem {
  readonly key: string;
  readonly label: string;
  readonly icon: string;
  readonly testId: string;
  readonly onSelect: () => void;
}

/** One previewed inbox entry. Carries no target content — only its title. */
export interface AppBarNotification {
  readonly id: string;
  readonly title: string;
  readonly receivedLabel: string;
  readonly isUnread: boolean;
}

/** Prepared, translated view model for the global top app bar. */
export interface AppBarView {
  /** The multi-team scope switcher; collapses itself for a single-team user. */
  readonly teamSwitcher: TeamSwitcherView;
  readonly isVisible: boolean;
  readonly ariaLabel: string;
  readonly title: string;
  readonly context: string;
  readonly themeToggleLabel: string;
  readonly isDark: boolean;
  readonly onToggleTheme: () => void;
  readonly notificationsLabel: string;
  readonly isNotificationsOpen: boolean;
  readonly onToggleNotifications: () => void;
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
  readonly onOpenNotification: (notificationId: string) => void;
  readonly onViewAllNotifications: () => void;
  readonly onOpenNotificationPreferences: () => void;
  readonly userName: string;
  readonly avatarLabel: string;
  readonly userMenuLabel: string;
  readonly isUserMenuOpen: boolean;
  readonly onToggleUserMenu: () => void;
  readonly userMenuItems: readonly AppBarMenuItem[];
}
