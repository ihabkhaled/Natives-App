import { requestMemberAliases } from '../gateways/members.gateway';
import { runMembersRequest } from '../helpers/to-members-error.helper';
import { mapMemberAlias } from '../mappers/member.mapper';
import type { MemberAlias } from '../types/members.types';

/** Use case: load a member's active aliases. */
export function getMemberAliases(
  teamId: string,
  membershipId: string,
): Promise<readonly MemberAlias[]> {
  return runMembersRequest(async () => {
    const dto = await requestMemberAliases(teamId, membershipId);
    return dto.items.map(mapMemberAlias);
  });
}
