import { FEATURE_FLAGS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { AdminContainer } from '../containers/admin.container';
import { adminPath } from './admin.paths';

/**
 * Admin console route. Gated on the manage-users permission and the
 * admin-console feature flag: navigation hides it and the guard blocks a
 * direct URL for any persona without that grant.
 */
export function getAdminRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: adminPath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: AdminContainer,
      meta: {
        key: 'admin',
        titleKey: I18N_KEYS.admin.title,
        permissions: [PERMISSIONS.usersManage],
        requiresTeamContext: false,
        offline: false,
        preload: false,
        featureFlag: FEATURE_FLAGS.adminConsole,
        nav: {
          order: 20,
          group: NAV_GROUP.Manage,
          iconName: 'shield',
          labelKey: I18N_KEYS.nav.admin,
        },
      },
    },
  ];
}
