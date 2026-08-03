import { requestAssignRole } from '../gateways/role-assignments.gateway';
import type { AssignRoleCommand, RoleAssignment } from '../types/role-assignments.types';

/**
 * Use case: grant one role inside one team scope.
 *
 * The client's job is to never ASK for something the server would refuse; the
 * server's job is to refuse anyway. Both hold: the command carries only a role
 * the assignable-roles catalog returned, and the backend re-checks the ceiling.
 */
export function assignRole(command: AssignRoleCommand): Promise<RoleAssignment> {
  return requestAssignRole(command);
}
