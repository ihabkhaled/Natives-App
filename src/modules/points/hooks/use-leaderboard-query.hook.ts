import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildLeaderboardQueryOptions } from '../queries/points.query';
import type { Leaderboard, LeaderboardFilters } from '../types/points.types';

/** One filtered, server-ranked leaderboard page. */
export function useLeaderboardQuery(
  teamId: string,
  filters: LeaderboardFilters,
): RemoteQueryView<Leaderboard> {
  return toRemoteQueryView(useAppQuery<Leaderboard>(buildLeaderboardQueryOptions(teamId, filters)));
}
