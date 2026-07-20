import { getMemberAliases } from '../services/get-member-aliases.service';
import { membersQueryKeys } from './members.keys';

/** Query options for a member's active aliases (manage-gated). */
export function buildMemberAliasesQueryOptions(
  teamId: string,
  membershipId: string,
  enabled: boolean,
) {
  return {
    queryKey: membersQueryKeys.aliases(teamId, membershipId),
    queryFn: () => getMemberAliases(teamId, membershipId),
    enabled: enabled && teamId !== '' && membershipId !== '',
  };
}
