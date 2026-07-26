import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  cohortComparisonPath,
  playerSeriesPath,
  rebuildAnalyticsPath,
  teamSeriesPath,
} from '../constants/analytics-api.constants';
import { ANALYTICS_LIMITS } from '../constants/analytics.constants';
import {
  analyticsSeriesResponseSchema,
  cohortComparisonResponseSchema,
  rebuildAnalyticsReportSchema,
} from '../schemas/analytics.schema';
import type {
  AnalyticsSeriesQuery,
  CohortComparisonQuery,
  RebuildAnalyticsCommand,
} from '../types/analytics.types';

type SeriesDto = SchemaOutput<typeof analyticsSeriesResponseSchema>;
type CohortDto = SchemaOutput<typeof cohortComparisonResponseSchema>;
type RebuildDto = SchemaOutput<typeof rebuildAnalyticsReportSchema>;

/** One player's chart-ready series (team read, or self read of own membership). */
export function requestPlayerSeries(
  teamId: string,
  subjectId: string,
  query: AnalyticsSeriesQuery,
): Promise<SeriesDto> {
  return getAppHttpClient().get(
    playerSeriesPath(teamId, subjectId),
    analyticsSeriesResponseSchema,
    {
      params: {
        dimension: query.dimension,
        periodType: query.periodType,
        limit: ANALYTICS_LIMITS.seriesLimit,
        offset: 0,
      },
    },
  );
}

/** The team's chart-ready series for one dimension. */
export function requestTeamSeries(teamId: string, query: AnalyticsSeriesQuery): Promise<SeriesDto> {
  return getAppHttpClient().get(teamSeriesPath(teamId), analyticsSeriesResponseSchema, {
    params: {
      dimension: query.dimension,
      periodType: query.periodType,
      limit: ANALYTICS_LIMITS.seriesLimit,
      offset: 0,
    },
  });
}

/** The privacy-safe cohort comparison for one dimension + period key. */
export function requestCohortComparison(
  teamId: string,
  query: CohortComparisonQuery,
): Promise<CohortDto> {
  return getAppHttpClient().get(cohortComparisonPath(teamId), cohortComparisonResponseSchema, {
    params: {
      dimension: query.dimension,
      periodType: query.periodType,
      periodKey: query.periodKey,
    },
  });
}

/** Idempotently rebuild the projections; each run cites its own report. */
export function requestRebuildAnalytics(
  teamId: string,
  command: RebuildAnalyticsCommand,
): Promise<RebuildDto> {
  return getAppHttpClient().post(
    rebuildAnalyticsPath(teamId),
    command,
    rebuildAnalyticsReportSchema,
  );
}
