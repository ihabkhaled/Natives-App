import { requestTeamSeries } from '../gateways/analytics.gateway';
import { runAnalyticsRequest } from '../helpers/to-analytics-error.helper';
import { mapAnalyticsSeries } from '../mappers/analytics.mapper';
import type { AnalyticsSeries, AnalyticsSeriesQuery } from '../types/analytics.types';

/** Use case: the team series for a dimension + period type. */
export function getTeamSeries(
  teamId: string,
  query: AnalyticsSeriesQuery,
): Promise<AnalyticsSeries> {
  return runAnalyticsRequest(async () =>
    mapAnalyticsSeries(await requestTeamSeries(teamId, query)),
  );
}
