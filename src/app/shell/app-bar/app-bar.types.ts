/** One entry of the avatar account menu. */
interface AppBarMenuItem {
  readonly key: string;
  readonly label: string;
  readonly icon: string;
  readonly testId: string;
  readonly onSelect: () => void;
}

/** Prepared, translated view model for the global top app bar. */
export interface AppBarView {
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
  readonly userName: string;
  readonly avatarLabel: string;
  readonly userMenuLabel: string;
  readonly isUserMenuOpen: boolean;
  readonly onToggleUserMenu: () => void;
  readonly userMenuItems: readonly AppBarMenuItem[];
}
