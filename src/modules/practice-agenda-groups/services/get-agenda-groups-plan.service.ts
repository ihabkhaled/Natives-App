import { requestAgendaGroupsPlan } from '../gateways/practice-agenda-groups.gateway';
import type {
  AgendaGroupsPlan,
  AgendaGroupsRequestParams,
} from '../types/practice-agenda-groups.types';

/** The coach's plan for one session: blocks, stations, and the groups they resolve to. */
export function getAgendaGroupsPlan(params: AgendaGroupsRequestParams): Promise<AgendaGroupsPlan> {
  return requestAgendaGroupsPlan(params);
}
