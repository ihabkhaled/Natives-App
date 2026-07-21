import { FEATURE_FLAGS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { AdminOperationsContainer } from '../containers/admin-operations.container';
import { AdminRolesContainer } from '../containers/admin-roles.container';
import { AdminRulesContainer } from '../containers/admin-rules.container';
import { AdminSettingsContainer } from '../containers/admin-settings.container';
import { AdminContainer } from '../containers/admin.container';
import {
  adminOperationsPath,
  adminPath,
  adminRolesPath,
  adminRulesPath,
  adminSettingsPath,
} from './admin.paths';

function hubRoute(): AppRouteDefinition {
  return {
    path: adminPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: AdminContainer,
    meta: {
      key: 'admin',
      titleKey: I18N_KEYS.admin.title,
      permissions: [PERMISSIONS.memberLifecycleManage],
      requiresTeamContext: false,
      offline: false,
      preload: false,
      featureFlag: FEATURE_FLAGS.adminConsole,
      nav: {
        order: 20,
        group: NAV_GROUP.Manage,
        iconName: 'shield',
        labelKey: I18N_KEYS.nav.admin,
      },
    },
  };
}

function settingsRoute(): AppRouteDefinition {
  return {
    path: adminSettingsPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: AdminSettingsContainer,
    meta: {
      key: 'admin-settings',
      titleKey: I18N_KEYS.adminSettings.title,
      permissions: [PERMISSIONS.settingsRead],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: FEATURE_FLAGS.adminConsole,
      nav: {
        order: 21,
        group: NAV_GROUP.Manage,
        iconName: 'settings',
        labelKey: I18N_KEYS.adminSettings.navLabel,
      },
    },
  };
}

function rolesRoute(): AppRouteDefinition {
  return {
    path: adminRolesPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: AdminRolesContainer,
    meta: {
      key: 'admin-roles',
      titleKey: I18N_KEYS.adminRoles.title,
      permissions: [PERMISSIONS.memberRolesManage],
      requiresTeamContext: true,
      offline: false,
      preload: false,
      featureFlag: FEATURE_FLAGS.adminConsole,
      nav: {
        order: 22,
        group: NAV_GROUP.Manage,
        iconName: 'shield',
        labelKey: I18N_KEYS.adminRoles.navLabel,
      },
    },
  };
}

function rulesRoute(): AppRouteDefinition {
  return {
    path: adminRulesPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: AdminRulesContainer,
    meta: {
      key: 'admin-rules',
      titleKey: I18N_KEYS.adminRules.title,
      permissions: [PERMISSIONS.pointsRuleManage],
      requiresTeamContext: true,
      offline: false,
      preload: false,
      featureFlag: FEATURE_FLAGS.adminConsole,
      nav: {
        order: 23,
        group: NAV_GROUP.Manage,
        iconName: 'clipboard',
        labelKey: I18N_KEYS.adminRules.navLabel,
      },
    },
  };
}

function operationsRoute(): AppRouteDefinition {
  return {
    path: adminOperationsPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: AdminOperationsContainer,
    meta: {
      key: 'admin-operations',
      titleKey: I18N_KEYS.adminOperations.title,
      permissions: [PERMISSIONS.outboxManage],
      requiresTeamContext: false,
      offline: false,
      preload: false,
      featureFlag: FEATURE_FLAGS.adminConsole,
      nav: {
        order: 24,
        group: NAV_GROUP.Manage,
        iconName: 'alert',
        labelKey: I18N_KEYS.adminOperations.navLabel,
      },
    },
  };
}

/**
 * Admin routes. Each carries the grant its screen actually needs, so the
 * sidebar, the guard, and the hub all agree; the backend re-authorizes every
 * operation regardless of what the shell shows.
 */
export function getAdminRouteDefinitions(): readonly AppRouteDefinition[] {
  return [settingsRoute(), rolesRoute(), rulesRoute(), operationsRoute(), hubRoute()];
}
