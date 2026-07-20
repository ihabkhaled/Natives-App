import { useState } from 'react';

import {
  useCurrentUserQuery,
  useEffectivePermissions,
  useLogoutMutation,
  useSession,
} from '@/modules/auth';
import { settingsPath, useThemeToggle } from '@/modules/settings';
import { APP_ICONS } from '@/packages/icons';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { TEST_IDS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import { getAppRouteDefinitions } from '../../router/route-registry';
import { selectRouteTitleKey } from './app-bar-title.helper';
import type { AppBarView } from './app-bar.types';

type PanelName = 'notifications' | 'user' | null;

/**
 * Prepared view model for the global top app bar. The bar only exists for a
 * resolved, authenticated session; the title follows the routed screen, and
 * only one popover may be open at a time so the two panels never overlap.
 */
export function useAppBar(): AppBarView {
  const session = useSession();
  const effective = useEffectivePermissions();
  const currentUser = useCurrentUserQuery();
  const logout = useLogoutMutation();
  const theme = useThemeToggle();
  const navigation = useAppNavigation();
  const { t } = useAppTranslation();
  const [openPanel, setOpenPanel] = useState<PanelName>(null);
  const titleKey = selectRouteTitleKey(getAppRouteDefinitions(), navigation.currentPath);
  const toggle = (panel: Exclude<PanelName, null>): void => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };
  return {
    isVisible: session.isAuthenticated && !effective.isLoading,
    ariaLabel: t(I18N_KEYS.appBar.label),
    title: titleKey === null ? t(I18N_KEYS.common.appName) : t(titleKey),
    context: t(I18N_KEYS.common.appName),
    themeToggleLabel: t(
      theme.isDark ? I18N_KEYS.appBar.switchToLight : I18N_KEYS.appBar.switchToDark,
    ),
    isDark: theme.isDark,
    onToggleTheme: theme.toggle,
    notificationsLabel: t(I18N_KEYS.appBar.notifications),
    isNotificationsOpen: openPanel === 'notifications',
    onToggleNotifications: () => {
      toggle('notifications');
    },
    notificationsEmptyTitle: t(I18N_KEYS.appBar.notificationsEmptyTitle),
    notificationsEmptyMessage: t(I18N_KEYS.appBar.notificationsEmptyMessage),
    userName: currentUser.user?.displayName ?? '',
    avatarLabel: t(I18N_KEYS.nav.profileLabel),
    userMenuLabel: t(I18N_KEYS.appBar.userMenu),
    isUserMenuOpen: openPanel === 'user',
    onToggleUserMenu: () => {
      toggle('user');
    },
    userMenuItems: [
      {
        key: 'settings',
        label: t(I18N_KEYS.appBar.settings),
        icon: APP_ICONS.settings,
        testId: TEST_IDS.appBarSettings,
        onSelect: () => {
          setOpenPanel(null);
          navigation.push(settingsPath());
        },
      },
      {
        key: 'sign-out',
        label: t(I18N_KEYS.appBar.signOut),
        icon: APP_ICONS.logOut,
        testId: TEST_IDS.appBarSignOut,
        onSelect: () => {
          setOpenPanel(null);
          logout.logout();
        },
      },
    ],
  };
}
