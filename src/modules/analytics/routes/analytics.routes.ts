import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { PlayerAnalyticsContainer } from '../containers/player-analytics.container';
import { TeamAnalyticsContainer } from '../containers/team-analytics.container';
import { analyticsPagePath, playerAnalyticsPattern } from './analytics.paths';

function teamAnalyticsRoute(): AppRouteDefinition {
  return {
    path: analyticsPagePath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: TeamAnalyticsContainer,
    meta: {
      key: 'analytics',
      titleKey: I18N_KEYS.analytics.title,
      permissions: [PERMISSIONS.analyticsReadTeam],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 47,
        group: NAV_GROUP.Team,
        iconName: 'statsChart',
        labelKey: I18N_KEYS.analytics.navLabel,
      },
    },
  };
}

/**
 * Deep-linked only. The guard carries no permission because the read is
 * dual-gated in the backend (analytics.read.team, or analytics.read.self for
 * exactly one's own membership) — the screen renders the designed forbidden
 * state for any other combination and the backend re-authorizes regardless.
 */
function playerAnalyticsRoute(): AppRouteDefinition {
  return {
    path: playerAnalyticsPattern(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: PlayerAnalyticsContainer,
    meta: {
      key: 'player-analytics',
      titleKey: I18N_KEYS.analytics.playerTitle,
      permissions: [],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

/** Team and player analytics; every read is a governed server projection. */
export function getAnalyticsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [teamAnalyticsRoute(), playerAnalyticsRoute()];
}
