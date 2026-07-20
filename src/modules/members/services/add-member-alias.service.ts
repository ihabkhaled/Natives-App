import { requestAddAlias } from '../gateways/members.gateway';
import { runMembersRequest } from '../helpers/to-members-error.helper';
import { mapMemberAlias } from '../mappers/member.mapper';
import type { MemberAlias } from '../types/members.types';

/** Use case: add one alias to a member. */
export function addMemberAlias(
  teamId: string,
  membershipId: string,
  alias: string,
): Promise<MemberAlias> {
  return runMembersRequest(async () =>
    mapMemberAlias(await requestAddAlias(teamId, membershipId, alias)),
  );
}
