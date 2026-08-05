import { getAgendaGroupsPlan } from '../services/get-agenda-groups-plan.service';
import type { AgendaGroupsPlan } from '../types/practice-agenda-groups.types';
import { practiceAgendaGroupsQueryKeys } from './practice-agenda-groups.keys';

/**
 * Query options for one session's coach plan. `enabled` guards the empty
 * session id: a route that failed to match must not fire a read at
 * `/practice-sessions//agenda/plan`.
 */
export function buildAgendaGroupsPlanQueryOptions(
  teamId: string,
  sessionId: string,
): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<AgendaGroupsPlan>;
  readonly enabled: boolean;
} {
  return {
    queryKey: practiceAgendaGroupsQueryKeys.plan(teamId, sessionId),
    queryFn: (): Promise<AgendaGroupsPlan> => getAgendaGroupsPlan({ teamId, sessionId }),
    enabled: sessionId !== '',
  };
}
