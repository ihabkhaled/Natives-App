import { requestAvatarAccess } from '../gateways/members.gateway';
import { runMembersRequest } from '../helpers/to-members-error.helper';
import { mapAvatarAccess } from '../mappers/member.mapper';
import type { AvatarAccess } from '../types/members.types';

/** Use case: resolve a signed avatar download URL (null when none). */
export function getMemberAvatar(teamId: string, membershipId: string): Promise<AvatarAccess> {
  return runMembersRequest(async () =>
    mapAvatarAccess(await requestAvatarAccess(teamId, membershipId)),
  );
}
