import { FEATURE_FLAGS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { PermissionsMatrixContainer } from '../containers/permissions-matrix.container';
import { SeasonsContainer } from '../containers/seasons.container';
import { TeamsContainer } from '../containers/teams.container';
import { permissionsMatrixPath, seasonsAdminPath, teamsAdminPath } from './teams.paths';

/**
 * Teams is a PLATFORM screen: browsing every team needs `team.browse.all`,
 * which only a super administrator holds. Gating it here means a team
 * administrator never sees the entry at all, instead of reaching a screen whose
 * every request answers 403.
 */
function teamsRoute(): AppRouteDefinition {
  return {
    path: teamsAdminPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: TeamsContainer,
    meta: {
      key: 'admin-teams',
      titleKey: I18N_KEYS.teamsAdmin.title,
      permissions: [PERMISSIONS.teamBrowseAll],
      requiresTeamContext: false,
      offline: false,
      preload: false,
      featureFlag: FEATURE_FLAGS.adminConsole,
      nav: {
        order: 25,
        group: NAV_GROUP.Manage,
        iconName: 'people',
        labelKey: I18N_KEYS.teamsAdmin.navLabel,
      },
    },
  };
}

/** Seasons are team-scoped: `team.read` to see them, `season.manage` to write. */
function seasonsRoute(): AppRouteDefinition {
  return {
    path: seasonsAdminPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: SeasonsContainer,
    meta: {
      key: 'admin-seasons',
      titleKey: I18N_KEYS.seasonsAdmin.title,
      permissions: [PERMISSIONS.teamRead],
      requiresTeamContext: true,
      offline: false,
      preload: false,
      featureFlag: FEATURE_FLAGS.adminConsole,
      nav: {
        order: 26,
        group: NAV_GROUP.Manage,
        iconName: 'calendar',
        labelKey: I18N_KEYS.seasonsAdmin.navLabel,
      },
    },
  };
}

/** The matrix is read-only and gated exactly as its endpoint is. */
function permissionsRoute(): AppRouteDefinition {
  return {
    path: permissionsMatrixPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: PermissionsMatrixContainer,
    meta: {
      key: 'admin-permissions',
      titleKey: I18N_KEYS.permissionsMatrix.title,
      permissions: [PERMISSIONS.memberRolesManage],
      requiresTeamContext: false,
      offline: false,
      preload: false,
      featureFlag: FEATURE_FLAGS.adminConsole,
      nav: {
        order: 27,
        group: NAV_GROUP.Manage,
        iconName: 'shield',
        labelKey: I18N_KEYS.permissionsMatrix.navLabel,
      },
    },
  };
}

export function getTeamsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [teamsRoute(), seasonsRoute(), permissionsRoute()];
}
