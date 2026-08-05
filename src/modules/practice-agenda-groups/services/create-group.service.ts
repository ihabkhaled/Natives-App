import { requestCreateGroup } from '../gateways/practice-agenda-groups.gateway';
import type { AgendaGroup, CreateGroupCommand } from '../types/practice-agenda-groups.types';

/** Start a new participant group for this session. */
export function createGroup(command: CreateGroupCommand): Promise<AgendaGroup> {
  return requestCreateGroup(command);
}
