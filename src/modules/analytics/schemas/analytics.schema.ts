import { isoInstantField, schemaBuilder } from '@/packages/schema';

import {
  ANALYTICS_DIMENSIONS,
  ANALYTICS_DIRECTIONS,
  ANALYTICS_PERIOD_TYPES,
  ANALYTICS_UNITS,
} from '../constants/analytics.constants';

/**
 * Wire contracts for the governed analytics read models, shared by remote
 * NestJS mode and MSW mock mode. A null point value is an evaluated gap —
 * the chart breaks the line, never drops to zero — and every series cites the
 * calculation version and server-authored summary it was computed with.
 */
export const analyticsSeriesResponseSchema = schemaBuilder.object({
  seriesId: schemaBuilder.string().min(1),
  dimension: schemaBuilder.enum(ANALYTICS_DIMENSIONS),
  unit: schemaBuilder.enum(ANALYTICS_UNITS),
  direction: schemaBuilder.enum(ANALYTICS_DIRECTIONS),
  periodType: schemaBuilder.enum(ANALYTICS_PERIOD_TYPES),
  calculationVersion: schemaBuilder.string().min(1),
  benchmarkLabel: schemaBuilder.string(),
  summary: schemaBuilder.string(),
  points: schemaBuilder.array(
    schemaBuilder.object({
      periodKey: schemaBuilder.string().min(1),
      value: schemaBuilder.number().nullable(),
      sampleSize: schemaBuilder.number().int().nonnegative(),
    }),
  ),
  computedAt: isoInstantField.nullable(),
});

export const cohortComparisonResponseSchema = schemaBuilder.object({
  dimension: schemaBuilder.enum(ANALYTICS_DIMENSIONS),
  periodKey: schemaBuilder.string().min(1),
  sampleSize: schemaBuilder.number().int().nonnegative(),
  suppressed: schemaBuilder.boolean(),
  average: schemaBuilder.number().nullable(),
  minimum: schemaBuilder.number().nullable(),
  maximum: schemaBuilder.number().nullable(),
});

export const rebuildAnalyticsReportSchema = schemaBuilder.object({
  seasonId: schemaBuilder.string().nullable(),
  periodType: schemaBuilder.enum(ANALYTICS_PERIOD_TYPES),
  calculationVersion: schemaBuilder.string().min(1),
  subjectsProjected: schemaBuilder.number().int().nonnegative(),
  projectionsWritten: schemaBuilder.number().int().nonnegative(),
  computedAt: isoInstantField,
});
