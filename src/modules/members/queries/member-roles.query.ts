import { getMemberRoles } from '../services/get-member-roles.service';
import { membersQueryKeys } from './members.keys';

/** Query options for a member's roles and the actor's assignable ceiling. */
export function buildMemberRolesQueryOptions(
  teamId: string,
  membershipId: string,
  enabled: boolean,
) {
  return {
    queryKey: membersQueryKeys.roles(teamId, membershipId),
    queryFn: () => getMemberRoles(teamId, membershipId),
    enabled: enabled && teamId !== '' && membershipId !== '',
  };
}
