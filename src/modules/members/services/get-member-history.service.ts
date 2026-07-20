import { requestMemberHistory } from '../gateways/members.gateway';
import { runMembersRequest } from '../helpers/to-members-error.helper';
import { mapMemberHistory } from '../mappers/member.mapper';
import type { MemberStatusEvent } from '../types/members.types';

/** Use case: load the append-only status-history timeline. */
export function getMemberHistory(
  teamId: string,
  membershipId: string,
): Promise<readonly MemberStatusEvent[]> {
  return runMembersRequest(async () =>
    mapMemberHistory(await requestMemberHistory(teamId, membershipId)),
  );
}
