import { requestUpdateProfile } from '../gateways/members.gateway';
import { runMembersRequest } from '../helpers/to-members-error.helper';
import { mapMemberProfile } from '../mappers/member.mapper';
import type { MemberProfile, UpdateProfileInput } from '../types/members.types';

/** Use case: update a member profile under optimistic concurrency. */
export function updateMemberProfile(
  teamId: string,
  membershipId: string,
  input: UpdateProfileInput,
): Promise<MemberProfile> {
  return runMembersRequest(async () =>
    mapMemberProfile(await requestUpdateProfile(teamId, membershipId, input)),
  );
}
