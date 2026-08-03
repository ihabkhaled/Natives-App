import { requestAssignableRoles } from '../gateways/role-assignments.gateway';
import type { AssignableRole } from '../types/role-assignments.types';

/**
 * Use case: the roles this actor may grant in this team.
 *
 * The list is the server's verdict on the actor's own privilege ceiling. It is
 * the only source the grant form draws from, which is what keeps the UI from
 * offering a role the backend would refuse with a 403.
 */
export function listAssignableRoles(teamId: string): Promise<readonly AssignableRole[]> {
  return requestAssignableRoles(teamId).then((catalog) => catalog.roles);
}
