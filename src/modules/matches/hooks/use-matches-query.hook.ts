import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildMatchesQueryOptions } from '../queries/matches.query';
import type { MatchPage } from '../types/matches.types';

/** One bounded page of the team's matches. */
export function useMatchesQuery(teamId: string): RemoteQueryView<MatchPage> {
  return toRemoteQueryView(useAppQuery<MatchPage>(buildMatchesQueryOptions(teamId)));
}
