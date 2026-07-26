import { requestPlayerSeries } from '../gateways/analytics.gateway';
import { runAnalyticsRequest } from '../helpers/to-analytics-error.helper';
import { mapAnalyticsSeries } from '../mappers/analytics.mapper';
import type { AnalyticsSeries, AnalyticsSeriesQuery } from '../types/analytics.types';

/** Use case: one player's series for a dimension + period type. */
export function getPlayerSeries(
  teamId: string,
  subjectId: string,
  query: AnalyticsSeriesQuery,
): Promise<AnalyticsSeries> {
  return runAnalyticsRequest(async () =>
    mapAnalyticsSeries(await requestPlayerSeries(teamId, subjectId, query)),
  );
}
