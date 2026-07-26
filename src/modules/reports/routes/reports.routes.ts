import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { ReportsContainer } from '../containers/reports.container';
import { reportsPagePath } from './reports.paths';

/**
 * The reports center. Listing is gated on `report.read`; the request, retry,
 * and download buttons are additionally gated on `report.generate` inside the
 * context hook (a hypothetical read-only grant sees the list only). Reads are
 * offline-aware; the backend re-authorizes every call.
 */
export function getReportsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: reportsPagePath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: ReportsContainer,
      meta: {
        key: 'reports',
        titleKey: I18N_KEYS.reports.title,
        permissions: [PERMISSIONS.reportsRead],
        requiresTeamContext: true,
        offline: true,
        preload: false,
        featureFlag: null,
        nav: {
          order: 60,
          group: NAV_GROUP.Manage,
          iconName: 'documentText',
          labelKey: I18N_KEYS.reports.navLabel,
        },
      },
    },
  ];
}
