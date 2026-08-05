import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { DrillDetailContainer } from '../containers/drill-detail.container';
import { DrillsCatalogueContainer } from '../containers/drills-catalogue.container';
import { drillDetailPattern, drillsPath } from './drills.paths';

/**
 * The team's reusable drill library: browse/search, and a detail screen that
 * doubles as create and edit (the `:drillId` route accepts the `new`
 * sentinel, see `DRILL_NEW_ID`).
 *
 * Both routes gate on `drill.manage`: the backend publishes no separate read
 * grant for the catalogue, and every action here — browsing, writing,
 * archiving — belongs to a coach. The backend re-authorizes every call
 * regardless.
 */
export function getDrillsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: drillsPath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: DrillsCatalogueContainer,
      meta: {
        key: 'drills',
        titleKey: I18N_KEYS.drills.title,
        permissions: [PERMISSIONS.drillManage],
        requiresTeamContext: true,
        offline: true,
        preload: false,
        featureFlag: null,
        nav: {
          order: 18,
          group: NAV_GROUP.Team,
          iconName: 'clipboard',
          labelKey: I18N_KEYS.drills.title,
        },
      },
    },
    {
      path: drillDetailPattern(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: DrillDetailContainer,
      meta: {
        key: 'drill-detail',
        titleKey: I18N_KEYS.drills.detailTitle,
        permissions: [PERMISSIONS.drillManage],
        requiresTeamContext: true,
        // Writing is the whole point of this screen; an offline shell could
        // only show stale fields beside controls that cannot save.
        offline: false,
        preload: false,
        featureFlag: null,
        // Drill-scoped: the list screen is the discoverable entry point.
        nav: null,
      },
    },
  ];
}
