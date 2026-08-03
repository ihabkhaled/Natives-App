import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { GovernanceContainer } from '../containers/governance.container';
import { governancePagePath } from './governance.paths';

/**
 * The board governance screen. Gated on `governance.read`; the server
 * additionally filters each record by its own visibility, so holding the grant
 * is not the same as seeing every meeting.
 */
export function getGovernanceRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: governancePagePath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: GovernanceContainer,
      meta: {
        key: 'governance',
        titleKey: I18N_KEYS.governance.title,
        permissions: [PERMISSIONS.governanceRead],
        requiresTeamContext: true,
        offline: true,
        preload: false,
        featureFlag: null,
        nav: {
          order: 65,
          group: NAV_GROUP.Manage,
          iconName: 'clipboard',
          labelKey: I18N_KEYS.governance.navLabel,
        },
      },
    },
  ];
}
