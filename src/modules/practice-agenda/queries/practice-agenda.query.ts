import { getPracticeAgenda } from '../services/get-practice-agenda.service';
import type { PracticeAgenda } from '../types/practice-agenda.types';
import { practiceAgendaQueryKeys } from './practice-agenda.keys';

/**
 * Query options for one session's plan. `enabled` guards the empty session id:
 * a route that failed to match must not fire a read at `/practice-sessions//agenda`.
 */
export function buildPracticeAgendaQueryOptions(
  teamId: string,
  sessionId: string,
): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<PracticeAgenda>;
  readonly enabled: boolean;
} {
  return {
    queryKey: practiceAgendaQueryKeys.agenda(teamId, sessionId),
    queryFn: (): Promise<PracticeAgenda> => getPracticeAgenda({ teamId, sessionId }),
    enabled: sessionId !== '',
  };
}
