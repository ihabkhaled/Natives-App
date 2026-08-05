import { requestAssignGroupMembers } from '../gateways/practice-agenda-groups.gateway';
import type { AgendaGroup, AssignGroupMembersCommand } from '../types/practice-agenda-groups.types';

/** Add one or more memberships to a group. */
export function assignGroupMembers(command: AssignGroupMembersCommand): Promise<AgendaGroup> {
  return requestAssignGroupMembers(command);
}
