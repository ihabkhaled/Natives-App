import { requestRemoveGroupMember } from '../gateways/practice-agenda-groups.gateway';
import type { RemoveGroupMemberCommand } from '../types/practice-agenda-groups.types';

/** Drop one membership from a group; the session and its roster are untouched. */
export function removeGroupMember(command: RemoveGroupMemberCommand): Promise<void> {
  return requestRemoveGroupMember(command);
}
