import type { SchemaOutput } from '@/packages/schema';

import type {
  analyticsSeriesResponseSchema,
  cohortComparisonResponseSchema,
  rebuildAnalyticsReportSchema,
} from '../schemas/analytics.schema';
import type {
  AnalyticsRebuildReport,
  AnalyticsSeries,
  CohortComparison,
} from '../types/analytics.types';

type SeriesDto = SchemaOutput<typeof analyticsSeriesResponseSchema>;
type CohortDto = SchemaOutput<typeof cohortComparisonResponseSchema>;
type RebuildDto = SchemaOutput<typeof rebuildAnalyticsReportSchema>;

/**
 * Pure DTO → domain projection. Point order is the server's period order; a
 * null value survives as null (an evaluated gap), and the summary sentence is
 * carried verbatim — the client never rephrases a statistic.
 */
export function mapAnalyticsSeries(dto: SeriesDto): AnalyticsSeries {
  return {
    seriesId: dto.seriesId,
    dimension: dto.dimension,
    unit: dto.unit,
    direction: dto.direction,
    periodType: dto.periodType,
    calculationVersion: dto.calculationVersion,
    benchmarkLabel: dto.benchmarkLabel,
    summary: dto.summary,
    points: dto.points.map((point) => ({
      periodKey: point.periodKey,
      value: point.value,
      sampleSize: point.sampleSize,
    })),
    computedAtIso: dto.computedAt,
  };
}

/** Suppression survives as-is: no stat is ever reconstructed client-side. */
export function mapCohortComparison(dto: CohortDto): CohortComparison {
  return {
    dimension: dto.dimension,
    periodKey: dto.periodKey,
    sampleSize: dto.sampleSize,
    suppressed: dto.suppressed,
    average: dto.average,
    minimum: dto.minimum,
    maximum: dto.maximum,
  };
}

export function mapRebuildReport(dto: RebuildDto): AnalyticsRebuildReport {
  return {
    seasonId: dto.seasonId,
    periodType: dto.periodType,
    calculationVersion: dto.calculationVersion,
    subjectsProjected: dto.subjectsProjected,
    projectionsWritten: dto.projectionsWritten,
    computedAtIso: dto.computedAt,
  };
}
