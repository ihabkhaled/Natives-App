import {
  useCurrentUserQuery,
  useEffectivePermissions,
  useLogoutMutation,
  useSession,
} from '@/modules/auth';
import { APP_ICONS } from '@/packages/icons';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { TEST_IDS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import { getAppRouteDefinitions } from '../../router/route-registry';
import { NAV_GROUP_LABEL_KEYS } from './navigation.constants';
import { groupVisibleNavItems, selectVisibleNavItems } from './nav-visibility.helper';
import type { PrimaryNavigationView } from './navigation.types';

/**
 * Prepared primary-navigation view model. Only shown to a resolved,
 * authenticated session; the items follow effective permissions and team
 * context, never role names. Destinations arrive grouped into sidebar
 * sections, and the signed-in identity carries its own sign-out action so the
 * control stays pinned inside the rail instead of floating in a screen.
 */
export function usePrimaryNavigation(): PrimaryNavigationView {
  const session = useSession();
  const effective = useEffectivePermissions();
  const currentUser = useCurrentUserQuery();
  const logout = useLogoutMutation();
  const { t } = useAppTranslation();
  const navigation = useAppNavigation();
  const isReady = session.isAuthenticated && !effective.isLoading;
  const displayName = currentUser.user?.displayName ?? null;
  const groups = groupVisibleNavItems(
    selectVisibleNavItems(getAppRouteDefinitions(), {
      permissions: effective.permissions,
      hasTeamContext: effective.hasTeamContext,
    }),
  );
  return {
    isVisible: isReady && groups.length > 0,
    ariaLabel: t(I18N_KEYS.nav.primaryLabel),
    appName: t(I18N_KEYS.common.appName),
    tagline: t(I18N_KEYS.brand.tagline),
    logoLabel: t(I18N_KEYS.brand.logoAlt),
    profile:
      displayName === null
        ? null
        : {
            name: displayName,
            label: t(I18N_KEYS.nav.profileLabel),
            signOutLabel: t(I18N_KEYS.nav.signOut),
            isSigningOut: logout.isLoggingOut,
            onSignOut: logout.logout,
          },
    groups: groups.map((group) => ({
      key: group.key,
      label: t(NAV_GROUP_LABEL_KEYS[group.key]),
      items: group.items.map((item) => ({
        key: item.key,
        label: t(item.labelKey),
        icon: APP_ICONS[item.iconName],
        testId: `${TEST_IDS.primaryNavItem}-${item.key}`,
        isActive: navigation.currentPath === item.path,
        onSelect: () => {
          navigation.push(item.path);
        },
      })),
    })),
  };
}
