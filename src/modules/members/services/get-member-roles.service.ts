import { requestMemberRoles } from '../gateways/members.gateway';
import { runMembersRequest } from '../helpers/to-members-error.helper';
import { mapMemberRoles } from '../mappers/member.mapper';
import type { MemberRoles } from '../types/members.types';

/** Use case: load a member's roles and the actor's assignable ceiling. */
export function getMemberRoles(teamId: string, membershipId: string): Promise<MemberRoles> {
  return runMembersRequest(async () =>
    mapMemberRoles(await requestMemberRoles(teamId, membershipId)),
  );
}
