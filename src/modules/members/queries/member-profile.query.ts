import { getMember } from '../services/get-member.service';
import { membersQueryKeys } from './members.keys';

/** Query options for one audience-shaped member profile. */
export function buildMemberProfileQueryOptions(teamId: string, membershipId: string) {
  return {
    queryKey: membersQueryKeys.member(teamId, membershipId),
    queryFn: () => getMember(teamId, membershipId),
    enabled: teamId !== '' && membershipId !== '',
  };
}
