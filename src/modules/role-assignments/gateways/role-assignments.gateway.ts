import { getAppHttpClient } from '@/packages/http';

import {
  assignableRolesPath,
  roleAssignmentPath,
  roleAssignmentsPath,
  userAssignmentsPath,
} from '../constants/role-assignments-api.constants';
import {
  assignableRoleCatalogSchema,
  roleAssignmentResponseSchema,
  userAssignmentsResponseSchema,
} from '../schemas/role-assignments.schema';
import type {
  AssignableRoleCatalog,
  AssignRoleCommand,
  RoleAssignment,
  UserAssignments,
} from '../types/role-assignments.types';

/** Every role one user currently holds, across every scope. */
export function requestUserAssignments(userId: string): Promise<UserAssignments> {
  return getAppHttpClient().get(userAssignmentsPath(userId), userAssignmentsResponseSchema);
}

/** The roles this actor may grant in this team, under their own ceiling. */
export function requestAssignableRoles(teamId: string): Promise<AssignableRoleCatalog> {
  return getAppHttpClient().get(assignableRolesPath(teamId), assignableRoleCatalogSchema);
}

/**
 * Grant one role. The scope rides in the query string exactly as the contract
 * specifies; `seasonId` is omitted rather than sent as null, so a season-less
 * grant cannot be read as "the null season".
 */
export function requestAssignRole(command: AssignRoleCommand): Promise<RoleAssignment> {
  return getAppHttpClient().post(
    roleAssignmentsPath(),
    { userId: command.userId, roleKey: command.roleKey },
    roleAssignmentResponseSchema,
    {
      params: {
        teamId: command.teamId,
        ...(command.seasonId === null ? {} : { seasonId: command.seasonId }),
      },
    },
  );
}

/**
 * Revoke one assignment. The response body echoes the revoked assignment; the
 * screen re-reads the list instead of trusting an echo, so it is discarded.
 */
export function requestRevokeAssignment(assignmentId: string): Promise<void> {
  return getAppHttpClient().delete(roleAssignmentPath(assignmentId));
}
