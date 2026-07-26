import type {
  AnalyticsDimension,
  AnalyticsDirection,
  AnalyticsPeriodType,
  AnalyticsUnit,
} from '../constants/analytics.constants';

/** One period of a chart-ready series; null value = evaluated gap. */
export interface AnalyticsSeriesPoint {
  readonly periodKey: string;
  readonly value: number | null;
  readonly sampleSize: number;
}

/** One governed, server-computed series with its citation metadata. */
export interface AnalyticsSeries {
  readonly seriesId: string;
  readonly dimension: AnalyticsDimension;
  readonly unit: AnalyticsUnit;
  readonly direction: AnalyticsDirection;
  readonly periodType: AnalyticsPeriodType;
  readonly calculationVersion: string;
  readonly benchmarkLabel: string;
  readonly summary: string;
  readonly points: readonly AnalyticsSeriesPoint[];
  readonly computedAtIso: string | null;
}

/** The scope of one series read. */
export interface AnalyticsSeriesQuery {
  readonly dimension: AnalyticsDimension;
  readonly periodType: AnalyticsPeriodType;
}

/** The privacy-safe cohort comparison; stats are null while suppressed. */
export interface CohortComparison {
  readonly dimension: AnalyticsDimension;
  readonly periodKey: string;
  readonly sampleSize: number;
  readonly suppressed: boolean;
  readonly average: number | null;
  readonly minimum: number | null;
  readonly maximum: number | null;
}

export interface CohortComparisonQuery {
  readonly dimension: AnalyticsDimension;
  readonly periodType: AnalyticsPeriodType;
  readonly periodKey: string;
}

/** The reconciliation of one idempotent projection rebuild. */
export interface AnalyticsRebuildReport {
  readonly seasonId: string | null;
  readonly periodType: AnalyticsPeriodType;
  readonly calculationVersion: string;
  readonly subjectsProjected: number;
  readonly projectionsWritten: number;
  readonly computedAtIso: string;
}

export interface RebuildAnalyticsCommand {
  readonly periodType: AnalyticsPeriodType;
  readonly seasonId: string | null;
}
