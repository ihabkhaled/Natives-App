import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS } from '@/shared/types';

import { RoleAssignmentsContainer } from '../containers/role-assignments.container';
import { roleAssignmentsPagePath } from './role-assignments.paths';
import { getRoleAssignmentsRouteDefinitions } from './role-assignments.routes';

describe('roleAssignmentsPagePath', () => {
  it('resolves to the registered admin path', () => {
    expect(roleAssignmentsPagePath()).toBe(APP_PATHS.roleAssignments);
  });
});

describe('getRoleAssignmentsRouteDefinitions', () => {
  it('registers the screen behind the role-management grant', () => {
    const [route] = getRoleAssignmentsRouteDefinitions();

    expect(route?.path).toBe(roleAssignmentsPagePath());
    expect(route?.access).toBe(ROUTE_ACCESS.Protected);
    expect(route?.component).toBe(RoleAssignmentsContainer);
    expect(route?.meta?.permissions).toEqual([PERMISSIONS.memberRolesManage]);
  });

  it('refuses to serve a stale picture of who holds what', () => {
    const [route] = getRoleAssignmentsRouteDefinitions();

    // Revoking against an hour-old list is how the wrong person keeps access.
    expect(route?.meta?.offline).toBe(false);
    expect(route?.meta?.requiresTeamContext).toBe(true);
    expect(route?.meta?.nav?.group).toBe(NAV_GROUP.Manage);
  });
});
