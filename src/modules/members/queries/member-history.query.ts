import { getMemberHistory } from '../services/get-member-history.service';
import { membersQueryKeys } from './members.keys';

/** Query options for a member's status-history timeline (admin-gated). */
export function buildMemberHistoryQueryOptions(
  teamId: string,
  membershipId: string,
  enabled: boolean,
) {
  return {
    queryKey: membersQueryKeys.history(teamId, membershipId),
    queryFn: () => getMemberHistory(teamId, membershipId),
    enabled: enabled && teamId !== '' && membershipId !== '',
  };
}
