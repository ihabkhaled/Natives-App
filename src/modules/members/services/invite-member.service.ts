import { requestInviteMember } from '../gateways/members.gateway';
import { runMembersRequest } from '../helpers/to-members-error.helper';
import { mapMembershipRecord } from '../mappers/member.mapper';
import type { InviteMemberInput, MembershipRecord } from '../types/members.types';

/** Use case: invite a person into the team. */
export function inviteMember(teamId: string, input: InviteMemberInput): Promise<MembershipRecord> {
  return runMembersRequest(async () =>
    mapMembershipRecord(await requestInviteMember(teamId, input)),
  );
}
