import { requestAssignableRoles } from '../gateways/members.gateway';
import { runMembersRequest } from '../helpers/to-members-error.helper';
import type { AssignableRole } from '../types/members.types';

/**
 * Use case: the team roles the acting principal may grant, straight from the
 * server catalog. The invite form's role select is fed from this list only —
 * no hard-coded role options exist anywhere in the client.
 */
export function listAssignableRoles(teamId: string): Promise<readonly AssignableRole[]> {
  return runMembersRequest(async () => {
    const response = await requestAssignableRoles(teamId);
    return response.roles.map((role) => ({
      slug: role.slug,
      displayName: role.displayName,
      description: role.description,
    }));
  });
}
