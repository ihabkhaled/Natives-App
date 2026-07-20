import { requestAttachAvatar, requestAvatarTicket } from '../gateways/members.gateway';
import { runMembersRequest } from '../helpers/to-members-error.helper';
import { mapMemberProfile } from '../mappers/member.mapper';
import type { MemberProfile } from '../types/members.types';

/**
 * Use case: replace a member's avatar. Requests a signed upload ticket, then
 * attaches the (mock scanned-clean) media and returns the reshaped view. The
 * device capture/crop/compress step is stubbed in this frontend slice, so a
 * tiny synthetic PNG payload stands in for the real capture pipeline.
 */
export function updateMemberAvatar(teamId: string, membershipId: string): Promise<MemberProfile> {
  return runMembersRequest(async () => {
    const ticket = await requestAvatarTicket(teamId, membershipId, 'image/png', 24_576);
    return mapMemberProfile(await requestAttachAvatar(teamId, membershipId, ticket.mediaId));
  });
}
