import { getMemberAvatar } from '../services/get-member-avatar.service';
import { membersQueryKeys } from './members.keys';

/** Query options for a member's signed avatar URL (fetched only when present). */
export function buildMemberAvatarQueryOptions(
  teamId: string,
  membershipId: string,
  enabled: boolean,
) {
  return {
    queryKey: membersQueryKeys.avatar(teamId, membershipId),
    queryFn: () => getMemberAvatar(teamId, membershipId),
    enabled: enabled && teamId !== '' && membershipId !== '',
  };
}
