import { getCohortComparison } from '../services/get-cohort-comparison.service';
import { getPlayerSeries } from '../services/get-player-series.service';
import { getTeamSeries } from '../services/get-team-series.service';
import type { AnalyticsSeriesQuery, CohortComparisonQuery } from '../types/analytics.types';
import { analyticsQueryKeys } from './analytics.keys';

/** Query options for the team series of one dimension + period type. */
export function buildTeamSeriesQueryOptions(teamId: string, query: AnalyticsSeriesQuery) {
  return {
    queryKey: analyticsQueryKeys.teamSeries(teamId, query.dimension, query.periodType),
    queryFn: () => getTeamSeries(teamId, query),
    enabled: teamId !== '',
  };
}

/** Query options for one player's series. */
export function buildPlayerSeriesQueryOptions(
  teamId: string,
  subjectId: string,
  query: AnalyticsSeriesQuery,
) {
  return {
    queryKey: analyticsQueryKeys.playerSeries(teamId, subjectId, query.dimension, query.periodType),
    queryFn: () => getPlayerSeries(teamId, subjectId, query),
    enabled: teamId !== '' && subjectId !== '',
  };
}

/** Query options for one cohort comparison; disabled until a period is chosen. */
export function buildCohortComparisonQueryOptions(teamId: string, query: CohortComparisonQuery) {
  return {
    queryKey: analyticsQueryKeys.cohort(teamId, query.dimension, query.periodType, query.periodKey),
    queryFn: () => getCohortComparison(teamId, query),
    enabled: teamId !== '' && query.periodKey !== '',
  };
}
