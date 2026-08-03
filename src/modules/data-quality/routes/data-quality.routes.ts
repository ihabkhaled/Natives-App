import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { DataQualityContainer } from '../containers/data-quality.container';
import { dataQualityPagePath } from './data-quality.paths';

/**
 * The data-quality operations queue. Reviewing and repairing are one grant —
 * `data_quality.manage` — so the route is gated on it and there is no
 * read-only variant. Reads are offline-aware; the backend re-authorizes every
 * call.
 */
export function getDataQualityRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: dataQualityPagePath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: DataQualityContainer,
      meta: {
        key: 'data-quality',
        titleKey: I18N_KEYS.dataQuality.title,
        permissions: [PERMISSIONS.dataQualityManage],
        requiresTeamContext: true,
        offline: true,
        preload: false,
        featureFlag: null,
        nav: {
          order: 70,
          group: NAV_GROUP.Manage,
          iconName: 'shield',
          labelKey: I18N_KEYS.dataQuality.navLabel,
        },
      },
    },
  ];
}
