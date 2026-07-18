import { useEffectivePermissions, useSession } from '@/modules/auth';
import { APP_ICONS } from '@/packages/icons';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { TEST_IDS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import { getAppRouteDefinitions } from '../../router/route-registry';
import { selectVisibleNavItems } from './nav-visibility.helper';
import type { PrimaryNavigationView } from './navigation.types';

/**
 * Prepared primary-navigation view model. Only shown to a resolved,
 * authenticated session; the items follow effective permissions and team
 * context, never role names.
 */
export function usePrimaryNavigation(): PrimaryNavigationView {
  const session = useSession();
  const effective = useEffectivePermissions();
  const { t } = useAppTranslation();
  const navigation = useAppNavigation();
  const isReady = session.isAuthenticated && !effective.isLoading;
  const items = selectVisibleNavItems(getAppRouteDefinitions(), {
    permissions: effective.permissions,
    hasTeamContext: effective.hasTeamContext,
  });
  return {
    isVisible: isReady && items.length > 0,
    ariaLabel: t(I18N_KEYS.nav.primaryLabel),
    appName: t(I18N_KEYS.common.appName),
    logoLabel: t(I18N_KEYS.brand.logoAlt),
    items: items.map((item) => ({
      key: item.key,
      label: t(item.labelKey),
      icon: APP_ICONS[item.iconName],
      testId: `${TEST_IDS.primaryNavItem}-${item.key}`,
      isActive: navigation.currentPath === item.path,
      onSelect: () => {
        navigation.push(item.path);
      },
    })),
  };
}
