import { describe, expect, it } from 'vitest';

import { APP_PATHS, FEATURE_FLAGS } from '@/shared/config';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS } from '@/shared/types';

import { getAdminRouteDefinitions } from './admin.routes';

describe('getAdminRouteDefinitions', () => {
  const route = getAdminRouteDefinitions()[0]!;

  it('exposes a single protected admin route', () => {
    expect(getAdminRouteDefinitions()).toHaveLength(1);
    expect(route.path).toBe(APP_PATHS.admin);
    expect(route.access).toBe(ROUTE_ACCESS.Protected);
    expect(route.component).toBeTypeOf('function');
  });

  it('requires the manage-users permission', () => {
    expect(route.meta?.permissions).toEqual([PERMISSIONS.usersManage]);
  });

  it('is gated behind the admin-console feature flag', () => {
    expect(route.meta?.featureFlag).toBe(FEATURE_FLAGS.adminConsole);
  });

  it('appears in the primary navigation with a stable icon and order', () => {
    expect(route.meta?.nav).toEqual({
      order: 20,
      group: NAV_GROUP.Manage,
      iconName: 'shield',
      labelKey: 'nav.admin',
    });
  });

  it('does not require an explicit team context', () => {
    expect(route.meta?.requiresTeamContext).toBe(false);
  });
});
