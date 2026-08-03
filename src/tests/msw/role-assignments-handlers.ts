import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import { apiUrl, failRequest, pathParam, readJsonBody } from './mock-request.helper';
import { has, queryValue } from './persona-permissions.helper';
import {
  MOCK_ASSIGNABLE_ROLES,
  MOCK_ASSIGNMENT_USER_ID,
  MOCK_ROLE_ASSIGNMENTS,
} from './role-assignments.fixture';

/** The roles the mock server refuses to grant through this route, as the real one does. */
const PROTECTED_ROLE_KEYS = new Set(['SUPER_ADMIN', 'PLATFORM_ADMIN']);

interface AssignRoleBody {
  readonly userId?: string;
  readonly roleKey?: string;
}

/**
 * NestJS-shaped RBAC assignment handlers.
 *
 * The mock reproduces the two refusals that shape the UI, so a screen that
 * ignores them fails here rather than in production:
 *
 * 1. The assignable-roles catalog never contains a role above the caller's
 *    ceiling — the grant form has nothing else to offer.
 * 2. Assigning a platform-scoped role through `/rbac/assignments` is a 403
 *    regardless of what the client sends, because that grant belongs to the
 *    audited `/rbac/platform/super-admins` flow.
 */
export const roleAssignmentsHandlers = [
  http.get(apiUrl('/rbac/users/:userId/assignments'), ({ request, params }) => {
    if (!has(request, PERMISSIONS.memberRolesManage)) {
      return failRequest(403, 'FORBIDDEN', '/rbac/users/assignments');
    }
    const userId = pathParam(params, 'userId');
    return HttpResponse.json({
      userId,
      assignments: userId === MOCK_ASSIGNMENT_USER_ID ? MOCK_ROLE_ASSIGNMENTS : [],
    });
  }),
  http.get(apiUrl('/rbac/teams/:teamId/assignable-roles'), ({ request, params }) =>
    has(request, PERMISSIONS.memberRolesManage)
      ? HttpResponse.json({ teamId: pathParam(params, 'teamId'), roles: MOCK_ASSIGNABLE_ROLES })
      : failRequest(403, 'FORBIDDEN', '/rbac/assignable-roles'),
  ),
  http.post(apiUrl('/rbac/assignments'), async ({ request }) => {
    if (!has(request, PERMISSIONS.memberRolesManage)) {
      return failRequest(403, 'FORBIDDEN', '/rbac/assignments');
    }
    const body = await readJsonBody<AssignRoleBody>(request);
    const roleKey = body.roleKey ?? '';
    if (PROTECTED_ROLE_KEYS.has(roleKey)) {
      return failRequest(403, 'PRIVILEGE_CEILING_EXCEEDED', '/rbac/assignments');
    }
    return HttpResponse.json(
      {
        id: `assignment-${roleKey.toLowerCase()}`,
        userId: body.userId ?? MOCK_ASSIGNMENT_USER_ID,
        roleKey,
        teamId: queryValue(request, 'teamId'),
        seasonId: queryValue(request, 'seasonId'),
        effectiveFrom: '2026-08-03T09:00:00.000Z',
        effectiveTo: null,
        grantedBy: 'admin-1',
        revokedAt: null,
        version: 1,
      },
      { status: 201 },
    );
  }),
  http.delete(apiUrl('/rbac/assignments/:assignmentId'), ({ request, params }) => {
    if (!has(request, PERMISSIONS.memberRolesManage)) {
      return failRequest(403, 'FORBIDDEN', '/rbac/assignments');
    }
    const assignmentId = pathParam(params, 'assignmentId');
    const found = MOCK_ROLE_ASSIGNMENTS.find((entry) => entry.id === assignmentId);
    if (found === undefined) {
      return failRequest(404, 'NOT_FOUND', '/rbac/assignments');
    }
    // A teamless assignment is the platform grant; the real service refuses to
    // end one here so the last-administrator check cannot be side-stepped.
    return found.teamId === null
      ? failRequest(403, 'PRIVILEGE_CEILING_EXCEEDED', '/rbac/assignments')
      : HttpResponse.json({ ...found, revokedAt: '2026-08-03T09:00:00.000Z' });
  }),
];
