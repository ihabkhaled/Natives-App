import { requestMember } from '../gateways/members.gateway';
import { runMembersRequest } from '../helpers/to-members-error.helper';
import { mapMemberProfile } from '../mappers/member.mapper';
import type { MemberProfile } from '../types/members.types';

/** Use case: load one audience-shaped member profile. */
export function getMember(teamId: string, membershipId: string): Promise<MemberProfile> {
  return runMembersRequest(async () => mapMemberProfile(await requestMember(teamId, membershipId)));
}
