import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { CompetitionDetailContainer } from '../containers/competition-detail.container';
import { CompetitionsContainer } from '../containers/competitions.container';
import { RosterDetailContainer } from '../containers/roster-detail.container';
import { RostersContainer } from '../containers/rosters.container';
import { SquadDetailContainer } from '../containers/squad-detail.container';
import { SquadsContainer } from '../containers/squads.container';
import {
  competitionDetailPattern,
  competitionsPath,
  rosterDetailPattern,
  rostersPath,
  squadDetailPattern,
  squadsPath,
} from './competitions.paths';

function competitionsRoute(): AppRouteDefinition {
  return {
    path: competitionsPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: CompetitionsContainer,
    meta: {
      key: 'competitions',
      titleKey: I18N_KEYS.competitions.title,
      permissions: [PERMISSIONS.competitionRead],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 40,
        group: NAV_GROUP.Team,
        iconName: 'trophy',
        labelKey: I18N_KEYS.competitions.navLabel,
      },
    },
  };
}

function competitionDetailRoute(): AppRouteDefinition {
  return {
    path: competitionDetailPattern(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: CompetitionDetailContainer,
    meta: {
      key: 'competition-detail',
      titleKey: I18N_KEYS.competitions.detailTitle,
      permissions: [PERMISSIONS.competitionRead],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

function squadsRoute(): AppRouteDefinition {
  return {
    path: squadsPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: SquadsContainer,
    meta: {
      key: 'squads',
      titleKey: I18N_KEYS.squads.title,
      permissions: [PERMISSIONS.squadRead],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 45,
        group: NAV_GROUP.Manage,
        iconName: 'clipboard',
        labelKey: I18N_KEYS.squads.navLabel,
      },
    },
  };
}

function squadDetailRoute(): AppRouteDefinition {
  return {
    path: squadDetailPattern(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: SquadDetailContainer,
    meta: {
      key: 'squad-detail',
      titleKey: I18N_KEYS.squads.detailTitle,
      permissions: [PERMISSIONS.squadRead],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

function rostersRoute(): AppRouteDefinition {
  return {
    path: rostersPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: RostersContainer,
    meta: {
      key: 'rosters',
      titleKey: I18N_KEYS.rosters.title,
      permissions: [PERMISSIONS.rosterRead],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 46,
        group: NAV_GROUP.Manage,
        iconName: 'people',
        labelKey: I18N_KEYS.rosters.navLabel,
      },
    },
  };
}

function rosterDetailRoute(): AppRouteDefinition {
  return {
    path: rosterDetailPattern(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: RosterDetailContainer,
    meta: {
      key: 'roster-detail',
      titleKey: I18N_KEYS.rosters.detailTitle,
      permissions: [PERMISSIONS.rosterRead],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

/**
 * Competition, squad, and roster routes. Reads are gated on `competition.read` and
 * `squad.read`; selection, override, and lifecycle actions carry their own
 * grants inside the screen and are re-authorized by the backend.
 */
export function getCompetitionsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    competitionsRoute(),
    competitionDetailRoute(),
    squadsRoute(),
    squadDetailRoute(),
    rostersRoute(),
    rosterDetailRoute(),
  ];
}
