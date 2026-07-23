import { describe, expect, it } from 'vitest';

import { APP_PATHS, FEATURE_FLAGS } from '@/shared/config';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS } from '@/shared/types';

import { getAdminRouteDefinitions } from './admin.routes';

const routes = getAdminRouteDefinitions();

function routeAt(path: string) {
  const match = routes.find((definition) => definition.path === path);
  expect(match).toBeDefined();
  return match!;
}

describe('getAdminRouteDefinitions', () => {
  it('exposes the hub and its five administrative screens', () => {
    expect(routes.map((definition) => definition.path)).toEqual([
      APP_PATHS.adminSettings,
      APP_PATHS.adminRoles,
      APP_PATHS.adminRules,
      APP_PATHS.adminOperations,
      APP_PATHS.adminPlatform,
      APP_PATHS.admin,
    ]);
  });

  it('protects every admin route behind the admin-console flag', () => {
    for (const route of routes) {
      expect(route.access).toBe(ROUTE_ACCESS.Protected);
      expect(route.component).toBeTypeOf('function');
      expect(route.meta?.featureFlag).toBe(FEATURE_FLAGS.adminConsole);
    }
  });

  it('carries the grant each screen actually needs, never a role name', () => {
    expect(routeAt(APP_PATHS.admin).meta?.permissions).toEqual([PERMISSIONS.memberLifecycleManage]);
    expect(routeAt(APP_PATHS.adminSettings).meta?.permissions).toEqual([PERMISSIONS.settingsRead]);
    expect(routeAt(APP_PATHS.adminRoles).meta?.permissions).toEqual([
      PERMISSIONS.memberRolesManage,
    ]);
    expect(routeAt(APP_PATHS.adminRules).meta?.permissions).toEqual([
      PERMISSIONS.calculationRuleManage,
    ]);
    expect(routeAt(APP_PATHS.adminOperations).meta?.permissions).toEqual([
      PERMISSIONS.outboxManage,
    ]);
  });

  it('keeps every admin destination in the Manage group with a stable order', () => {
    const orders = routes.map((route) => route.meta?.nav?.order);
    expect(orders).toEqual([21, 22, 23, 24, 25, 20]);
    for (const route of routes) {
      expect(route.meta?.nav?.group).toBe(NAV_GROUP.Manage);
      expect(route.meta?.nav?.labelKey).toMatch(/^(nav|admin)/u);
    }
  });

  it('guards the platform panel behind the GLOBAL platform.admin grant only', () => {
    expect(routeAt(APP_PATHS.adminPlatform).meta?.permissions).toEqual([PERMISSIONS.platformAdmin]);
    expect(routeAt(APP_PATHS.adminPlatform).meta?.requiresTeamContext).toBe(false);
  });

  it('scopes the team-bound screens and leaves the global ones unscoped', () => {
    expect(routeAt(APP_PATHS.admin).meta?.requiresTeamContext).toBe(false);
    expect(routeAt(APP_PATHS.adminOperations).meta?.requiresTeamContext).toBe(false);
    expect(routeAt(APP_PATHS.adminSettings).meta?.requiresTeamContext).toBe(true);
    expect(routeAt(APP_PATHS.adminRules).meta?.requiresTeamContext).toBe(true);
  });
});
