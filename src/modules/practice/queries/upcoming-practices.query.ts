import { getUpcomingPractices } from '../services/get-upcoming-practices.service';
import { practiceQueryKeys } from './practice.keys';

/**
 * Query options for the bounded upcoming list. A long stale/gc time keeps the
 * approved reads available offline after the first successful fetch.
 */
export function buildUpcomingPracticesQueryOptions(teamId: string) {
  return {
    queryKey: practiceQueryKeys.upcoming(teamId),
    queryFn: () => getUpcomingPractices(teamId),
    enabled: teamId !== '',
    staleTime: 300_000,
    gcTime: 86_400_000,
  };
}
