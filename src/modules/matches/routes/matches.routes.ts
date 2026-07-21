import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { MatchStatisticsContainer } from '../containers/match-statistics.container';
import { MatchesContainer } from '../containers/matches.container';
import { ScoreboardContainer } from '../containers/scoreboard.container';
import { matchScoreboardPattern, matchStatisticsPattern, matchesPattern } from './matches.paths';

function matchesRoute(): AppRouteDefinition {
  return {
    path: matchesPattern(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: MatchesContainer,
    meta: {
      key: 'matches',
      titleKey: I18N_KEYS.matches.title,
      permissions: [PERMISSIONS.matchRead],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 47,
        group: NAV_GROUP.Team,
        iconName: 'stopwatch',
        labelKey: I18N_KEYS.matches.navLabel,
      },
    },
  };
}

function scoreboardRoute(): AppRouteDefinition {
  return {
    path: matchScoreboardPattern(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: ScoreboardContainer,
    meta: {
      key: 'match-scoreboard',
      titleKey: I18N_KEYS.scoreboard.title,
      permissions: [PERMISSIONS.matchRead],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

function statisticsRoute(): AppRouteDefinition {
  return {
    path: matchStatisticsPattern(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: MatchStatisticsContainer,
    meta: {
      key: 'match-statistics',
      titleKey: I18N_KEYS.matchStats.title,
      permissions: [PERMISSIONS.matchStatsRead],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

/**
 * Match routes. Reading a match and its scoreboard needs `match.read`;
 * the scoring controls inside the scoreboard additionally require
 * `match.score`, and the backend re-authorizes every write.
 */
export function getMatchesRouteDefinitions(): readonly AppRouteDefinition[] {
  return [matchesRoute(), scoreboardRoute(), statisticsRoute()];
}
