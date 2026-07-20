import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import { leaderboardPath, myPointsPath } from '../constants/points-api.constants';
import { LEADERBOARD_LIMITS } from '../constants/points.constants';
import { leaderboardResponseSchema, pointsSummaryResponseSchema } from '../schemas/points.schema';
import type { LeaderboardFilters } from '../types/points.types';

type LeaderboardDto = SchemaOutput<typeof leaderboardResponseSchema>;
type SummaryDto = SchemaOutput<typeof pointsSummaryResponseSchema>;

/** One bounded, server-ranked leaderboard page for the chosen filters. */
export function requestLeaderboard(
  teamId: string,
  filters: LeaderboardFilters,
): Promise<LeaderboardDto> {
  return getAppHttpClient().get(leaderboardPath(teamId), leaderboardResponseSchema, {
    params: {
      period: filters.period,
      cohort: filters.cohort,
      limit: LEADERBOARD_LIMITS.pageSize,
      offset: 0,
      ...(filters.category === null ? {} : { category: filters.category }),
    },
  });
}

/** The caller's own total, append-only ledger, and awarded badges. */
export function requestMyPoints(teamId: string): Promise<SummaryDto> {
  return getAppHttpClient().get(myPointsPath(teamId), pointsSummaryResponseSchema);
}
