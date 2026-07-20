import { requestAssignRoles } from '../gateways/members.gateway';
import { runMembersRequest } from '../helpers/to-members-error.helper';
import { mapMemberRoles } from '../mappers/member.mapper';
import type { MemberRole } from '../constants/members.constants';
import type { MemberRoles } from '../types/members.types';

/** Use case: replace a member's role set within the actor's ceiling. */
export function assignMemberRoles(
  teamId: string,
  membershipId: string,
  roles: readonly MemberRole[],
): Promise<MemberRoles> {
  return runMembersRequest(async () =>
    mapMemberRoles(await requestAssignRoles(teamId, membershipId, roles)),
  );
}
