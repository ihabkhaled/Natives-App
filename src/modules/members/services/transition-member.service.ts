import { LIFECYCLE_ACTION_ENDPOINT } from '../constants/members.constants';
import { requestTransition } from '../gateways/members.gateway';
import { runMembersRequest } from '../helpers/to-members-error.helper';
import { mapMembershipRecord } from '../mappers/member.mapper';
import type { MembershipRecord, TransitionInput } from '../types/members.types';

/** Use case: run a lifecycle transition (activate/suspend/archive/…). */
export function transitionMember(
  teamId: string,
  membershipId: string,
  input: TransitionInput,
): Promise<MembershipRecord> {
  const endpoint = LIFECYCLE_ACTION_ENDPOINT[input.action];
  return runMembersRequest(async () =>
    mapMembershipRecord(await requestTransition(teamId, membershipId, endpoint, input.reason)),
  );
}
