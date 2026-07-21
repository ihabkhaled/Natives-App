import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';
import { NAV_GROUP, ROUTE_ACCESS } from '@/shared/types';

import { getNotificationsRouteDefinitions } from './notifications.routes';

const routes = getNotificationsRouteDefinitions();

function routeAt(path: string) {
  const match = routes.find((definition) => definition.path === path);
  expect(match).toBeDefined();
  return match!;
}

describe('getNotificationsRouteDefinitions', () => {
  it('registers the preference screen before the inbox so neither shadows the other', () => {
    expect(routes.map((definition) => definition.path)).toEqual([
      APP_PATHS.notificationPreferences,
      APP_PATHS.notifications,
      APP_PATHS.notificationLink,
    ]);
  });

  it('protects every notification screen behind an authenticated session', () => {
    for (const route of routes) {
      expect(route.access).toBe(ROUTE_ACCESS.Protected);
      expect(route.exact).toBe(true);
      expect(route.component).toBeTypeOf('function');
    }
  });

  it('carries no permission of its own: the inbox is the caller own mail', () => {
    for (const route of routes) {
      expect(route.meta?.permissions).toEqual([]);
    }
  });

  it('re-checks the target grants on arrival instead of guarding the link route', () => {
    // The link route deliberately holds no permission: the grant that matters
    // belongs to the *target*, and only an arrival-time check stays correct
    // after a revocation.
    expect(routeAt(APP_PATHS.notificationLink).meta?.permissions).toEqual([]);
    expect(routeAt(APP_PATHS.notificationLink).meta?.nav).toBeNull();
  });

  it('puts only the inbox in the primary navigation', () => {
    expect(routeAt(APP_PATHS.notifications).meta?.nav).toEqual({
      order: 15,
      group: NAV_GROUP.Overview,
      iconName: 'notifications',
      labelKey: 'notifications.navLabel',
    });
    expect(routeAt(APP_PATHS.notificationPreferences).meta?.nav).toBeNull();
  });

  it('needs no team scope, because an inbox belongs to the person not the team', () => {
    for (const route of routes) {
      expect(route.meta?.requiresTeamContext).toBe(false);
      expect(route.meta?.featureFlag).toBeNull();
    }
  });

  it('marks only the inbox as offline-capable', () => {
    expect(routeAt(APP_PATHS.notifications).meta?.offline).toBe(true);
    expect(routeAt(APP_PATHS.notificationLink).meta?.offline).toBe(false);
  });
});
