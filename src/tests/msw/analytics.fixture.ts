import type {
  analyticsSeriesResponseSchema,
  cohortComparisonResponseSchema,
  rebuildAnalyticsReportSchema,
} from '@/modules/analytics';
import type { SchemaOutput } from '@/packages/schema';

type SeriesDto = SchemaOutput<typeof analyticsSeriesResponseSchema>;
type CohortDto = SchemaOutput<typeof cohortComparisonResponseSchema>;
type RebuildDto = SchemaOutput<typeof rebuildAnalyticsReportSchema>;

export const MOCK_ANALYTICS = {
  teamId: 'team-natives',
  memberId: '10000000-0000-4000-8000-000000000001',
  ownMemberId: 'membership-natives-1',
  unknownMemberId: '10000000-0000-4000-8000-0000000009999',
  suppressedPeriodKey: '2026-02',
  freshComputedAt: '2026-07-23T06:00:00.000Z',
} as const;

/**
 * A monthly attendance series with a deliberate null gap in the middle, so the
 * chart's line-break and the tabular twin's "not evaluated" row are both
 * exercised. The summary is server-authored and rendered verbatim.
 */
export function analyticsSeriesResponse(dimension: string, subjectId?: string): SeriesDto {
  return {
    seriesId: `series-${dimension}-${subjectId ?? 'team'}`,
    dimension: dimension as SeriesDto['dimension'],
    unit: 'ratio',
    direction: 'higher_better',
    periodType: 'monthly',
    calculationVersion: 'analytics-v1',
    benchmarkLabel: 'Squad median',
    summary: 'Attendance rose after the February break and held above the squad median.',
    points: [
      { periodKey: '2026-01', value: 0.62, sampleSize: 18 },
      { periodKey: MOCK_ANALYTICS.suppressedPeriodKey, value: null, sampleSize: 3 },
      { periodKey: '2026-03', value: 0.74, sampleSize: 20 },
      { periodKey: '2026-04', value: 0.81, sampleSize: 21 },
    ],
    computedAt: MOCK_ANALYTICS.freshComputedAt,
  };
}

/**
 * The cohort comparison: the February period is suppressed (only 3 members),
 * every other period returns real min/avg/max.
 */
export function cohortComparisonResponse(dimension: string, periodKey: string): CohortDto {
  if (periodKey === MOCK_ANALYTICS.suppressedPeriodKey) {
    return {
      dimension: dimension as CohortDto['dimension'],
      periodKey,
      sampleSize: 3,
      suppressed: true,
      average: null,
      minimum: null,
      maximum: null,
    };
  }
  return {
    dimension: dimension as CohortDto['dimension'],
    periodKey,
    sampleSize: 20,
    suppressed: false,
    average: 0.72,
    minimum: 0.48,
    maximum: 0.95,
  };
}

export function rebuildReport(periodType: string): RebuildDto {
  return {
    seasonId: null,
    periodType: periodType as RebuildDto['periodType'],
    calculationVersion: 'analytics-v1',
    subjectsProjected: 22,
    projectionsWritten: 88,
    computedAt: '2026-07-23T09:00:00.000Z',
  };
}
