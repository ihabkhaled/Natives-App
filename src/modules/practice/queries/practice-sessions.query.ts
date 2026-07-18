import type { PracticeSessionListPage, PracticeSessionQueryParams } from '../types/practice.types';
import { listPracticeSessions } from '../services/list-practice-sessions.service';
import { practiceQueryKeys } from './practice.keys';

/**
 * Query options for one bounded, filtered calendar page. `placeholderData`
 * keeps the previous page visible while a filter change or "show more" fetches
 * the next window, so the list never collapses into a loading spinner.
 */
export function buildPracticeSessionsQueryOptions(params: PracticeSessionQueryParams) {
  return {
    queryKey: practiceQueryKeys.sessions(params),
    queryFn: () => listPracticeSessions(params),
    placeholderData: (previous: PracticeSessionListPage | undefined) => previous,
  };
}
