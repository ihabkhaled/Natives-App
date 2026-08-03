import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { JerseyContainer } from '../containers/jersey.container';
import { jerseyPagePath } from './jersey.paths';

/**
 * The jersey orders screen. Gated on `jersey.read` — the list is team facts,
 * not member data — while `jersey.manage` decides who may open an order and
 * read the names being printed. Reads are offline-aware; the backend
 * re-authorizes every call.
 */
export function getJerseyRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: jerseyPagePath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: JerseyContainer,
      meta: {
        key: 'jersey',
        titleKey: I18N_KEYS.jersey.title,
        permissions: [PERMISSIONS.jerseyRead],
        requiresTeamContext: true,
        offline: true,
        preload: false,
        featureFlag: null,
        nav: {
          order: 75,
          group: NAV_GROUP.Manage,
          iconName: 'clipboard',
          labelKey: I18N_KEYS.jersey.navLabel,
        },
      },
    },
  ];
}
