import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { LeaderboardContainer } from '../containers/leaderboard.container';
import { PointsHistoryContainer } from '../containers/points-history.container';
import { leaderboardPagePath, pointsHistoryPath } from './points.paths';

function leaderboardRoute(): AppRouteDefinition {
  return {
    path: leaderboardPagePath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: LeaderboardContainer,
    meta: {
      key: 'leaderboard',
      titleKey: I18N_KEYS.points.leaderboardTitle,
      permissions: [PERMISSIONS.leaderboardsRead],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 40,
        group: NAV_GROUP.Team,
        iconName: 'trophy',
        labelKey: I18N_KEYS.points.leaderboardNavLabel,
      },
    },
  };
}

function historyRoute(): AppRouteDefinition {
  return {
    path: pointsHistoryPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: PointsHistoryContainer,
    meta: {
      key: 'points-history',
      titleKey: I18N_KEYS.points.historyTitle,
      permissions: [PERMISSIONS.pointsReadSelf],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 45,
        group: NAV_GROUP.Team,
        iconName: 'ribbon',
        labelKey: I18N_KEYS.points.historyNavLabel,
      },
    },
  };
}

/**
 * Leaderboard and personal-ledger routes. The board is gated on
 * `leaderboard.read` and the ledger on `points.read.self`; the guard blocks a
 * direct URL without the grant and the backend re-authorizes every read.
 */
export function getPointsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [leaderboardRoute(), historyRoute()];
}
