import { requestRemoveGroup } from '../gateways/practice-agenda-groups.gateway';
import type { RemoveGroupCommand } from '../types/practice-agenda-groups.types';

/** Drop a group entirely; its members leave the group, not the session. */
export function removeGroup(command: RemoveGroupCommand): Promise<void> {
  return requestRemoveGroup(command);
}
