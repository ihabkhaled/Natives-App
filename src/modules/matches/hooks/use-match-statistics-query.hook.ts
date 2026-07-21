import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildMatchStatisticsQueryOptions } from '../queries/matches.query';
import type { MatchStatistics } from '../types/matches.types';

/** The server-derived statistics projection for one match (backend 504). */
export function useMatchStatisticsQuery(
  teamId: string,
  matchId: string,
): RemoteQueryView<MatchStatistics> {
  return toRemoteQueryView(
    useAppQuery<MatchStatistics>(buildMatchStatisticsQueryOptions(teamId, matchId)),
  );
}
