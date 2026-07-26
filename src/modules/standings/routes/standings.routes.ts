import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { AchievementsContainer } from '../containers/achievements.container';
import { StandingsContainer } from '../containers/standings.container';
import { StandingsRulesContainer } from '../containers/standings-rules.container';
import { TeamHistoryContainer } from '../containers/team-history.container';
import {
  achievementsPagePath,
  standingsPagePath,
  standingsRulesPagePath,
  teamHistoryPagePath,
} from './standings.paths';

function standingsRoute(): AppRouteDefinition {
  return {
    path: standingsPagePath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: StandingsContainer,
    meta: {
      key: 'standings',
      titleKey: I18N_KEYS.standings.title,
      permissions: [PERMISSIONS.competitionRead],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 52,
        group: NAV_GROUP.Team,
        iconName: 'podium',
        labelKey: I18N_KEYS.standings.navLabel,
      },
    },
  };
}

/** Deep-linked from the standings footer; never a nav destination. */
function rulesRoute(): AppRouteDefinition {
  return {
    path: standingsRulesPagePath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: StandingsRulesContainer,
    meta: {
      key: 'standings-rules',
      titleKey: I18N_KEYS.standings.rulesTitle,
      permissions: [PERMISSIONS.competitionRead],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

/**
 * The management workspace. The nav entry (and the guard) demand
 * `competition.manage` so a Member's navigation stays clean; read-only
 * personas reach achievement facts through the trophy cabinet instead.
 */
function achievementsRoute(): AppRouteDefinition {
  return {
    path: achievementsPagePath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: AchievementsContainer,
    meta: {
      key: 'achievements',
      titleKey: I18N_KEYS.standings.achievementsTitle,
      permissions: [PERMISSIONS.competitionManage],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 56,
        group: NAV_GROUP.Manage,
        iconName: 'medal',
        labelKey: I18N_KEYS.standings.achievementsNavLabel,
      },
    },
  };
}

function teamHistoryRoute(): AppRouteDefinition {
  return {
    path: teamHistoryPagePath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: TeamHistoryContainer,
    meta: {
      key: 'team-history',
      titleKey: I18N_KEYS.standings.historyTitle,
      permissions: [PERMISSIONS.teamRead],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 54,
        group: NAV_GROUP.Team,
        iconName: 'trophy',
        labelKey: I18N_KEYS.standings.historyNavLabel,
      },
    },
  };
}

/**
 * Standings, rules, achievements, and the trophy cabinet. Reads are gated on
 * `competition.read` / `team.read`; the achievements workspace on
 * `competition.manage`. The backend re-authorizes every call.
 */
export function getStandingsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [standingsRoute(), rulesRoute(), teamHistoryRoute(), achievementsRoute()];
}
