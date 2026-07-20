import { requestLeaderboard } from '../gateways/points.gateway';
import { runPointsRequest } from '../helpers/to-points-error.helper';
import { mapLeaderboard } from '../mappers/points.mapper';
import type { Leaderboard, LeaderboardFilters } from '../types/points.types';

/** Use case: the team leaderboard for one period / cohort / category. */
export function getLeaderboard(teamId: string, filters: LeaderboardFilters): Promise<Leaderboard> {
  return runPointsRequest(async () => mapLeaderboard(await requestLeaderboard(teamId, filters)));
}
