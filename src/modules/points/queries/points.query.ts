import { getLeaderboard } from '../services/get-leaderboard.service';
import { getMyPoints } from '../services/get-my-points.service';
import type { LeaderboardFilters } from '../types/points.types';
import { pointsQueryKeys } from './points.keys';

/** Query options for one filtered leaderboard page. */
export function buildLeaderboardQueryOptions(teamId: string, filters: LeaderboardFilters) {
  return {
    queryKey: pointsQueryKeys.leaderboard(
      teamId,
      filters.period,
      filters.cohort,
      filters.category ?? 'all',
    ),
    queryFn: () => getLeaderboard(teamId, filters),
    enabled: teamId !== '',
  };
}

/** Query options for the caller's own summary and ledger. */
export function buildMyPointsQueryOptions(teamId: string) {
  return {
    queryKey: pointsQueryKeys.mine(teamId),
    queryFn: () => getMyPoints(teamId),
    enabled: teamId !== '',
  };
}
