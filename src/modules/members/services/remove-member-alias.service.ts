import { requestRemoveAlias } from '../gateways/members.gateway';
import { runMembersRequest } from '../helpers/to-members-error.helper';

/** Use case: remove one alias from a member. */
export function removeMemberAlias(
  teamId: string,
  membershipId: string,
  aliasId: string,
): Promise<void> {
  return runMembersRequest(() => requestRemoveAlias(teamId, membershipId, aliasId));
}
