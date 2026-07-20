import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type {
  AssessmentFilterOption,
  RadarChartView,
  TrendChartView,
} from '../types/assessments-view.types';
import type {
  AssessmentCatalog,
  MetricDefinition,
  PublishedAssessment,
} from '../types/assessments.types';
import {
  buildRadarChartView,
  buildTrendChartView,
  orderByPeriod,
  publishedMetrics,
} from './performance-series.helper';

type Translate = (key: string, params?: TranslateParams) => string;

export interface PerformanceChartsView {
  readonly metricOptions: readonly AssessmentFilterOption[];
  readonly selectedMetricId: string;
  readonly trend: TrendChartView | null;
  readonly radar: RadarChartView | null;
}

/** How many published periods actually carry a reading for one metric. */
function evaluatedCount(
  assessments: readonly PublishedAssessment[],
  metricDefinitionId: string,
): number {
  return assessments.filter((assessment) =>
    assessment.values.some(
      (value) => value.metricDefinitionId === metricDefinitionId && value.numericValue !== null,
    ),
  ).length;
}

/**
 * The selected metric, defaulting to the best-covered one so the first view a
 * player lands on is the most informative rather than the alphabetically first.
 */
function resolveActiveMetric(
  metrics: readonly MetricDefinition[],
  assessments: readonly PublishedAssessment[],
  selectedMetricId: string,
): MetricDefinition | undefined {
  const selected = metrics.find((metric) => metric.id === selectedMetricId);
  if (selected !== undefined) {
    return selected;
  }
  return [...metrics].sort(
    (left, right) => evaluatedCount(assessments, right.id) - evaluatedCount(assessments, left.id),
  )[0];
}

/**
 * Both charts plus the metric switch. Either chart is `null` until the catalog
 * and at least one published assessment have resolved — a chart is never drawn
 * from assumed data.
 */
export function buildPerformanceCharts(
  t: Translate,
  catalog: AssessmentCatalog | undefined,
  assessments: readonly PublishedAssessment[],
  selectedMetricId: string,
): PerformanceChartsView {
  const metrics = catalog === undefined ? [] : publishedMetrics(catalog, assessments);
  const activeMetric = resolveActiveMetric(metrics, assessments, selectedMetricId);
  const latest = orderByPeriod(assessments).at(-1);
  return {
    metricOptions: metrics.map((metric) => ({ value: metric.id, label: metric.name })),
    selectedMetricId: activeMetric?.id ?? '',
    trend:
      catalog === undefined || activeMetric === undefined
        ? null
        : buildTrendChartView(t, catalog, assessments, activeMetric),
    radar:
      catalog === undefined || latest === undefined
        ? null
        : buildRadarChartView(t, catalog, latest),
  };
}

/** The static panel copy the performance screen shares. */
export function buildPerformanceCopy(t: Translate): {
  readonly title: string;
  readonly subtitle: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly metricSelectLabel: string;
  readonly feedbackTitle: string;
  readonly feedbackEmptyTitle: string;
  readonly feedbackEmptyMessage: string;
  readonly goalsTitle: string;
  readonly goalsEmptyTitle: string;
  readonly goalsEmptyMessage: string;
} {
  return {
    title: t(I18N_KEYS.assessments.performanceTitle),
    subtitle: t(I18N_KEYS.assessments.performanceSubtitle),
    emptyTitle: t(I18N_KEYS.assessments.emptyTitle),
    emptyMessage: t(I18N_KEYS.assessments.emptyMessage),
    metricSelectLabel: t(I18N_KEYS.assessments.chartMetricSelectLabel),
    feedbackTitle: t(I18N_KEYS.assessments.feedbackTitle),
    feedbackEmptyTitle: t(I18N_KEYS.assessments.feedbackEmptyTitle),
    feedbackEmptyMessage: t(I18N_KEYS.assessments.feedbackEmptyMessage),
    goalsTitle: t(I18N_KEYS.assessments.goalsTitle),
    goalsEmptyTitle: t(I18N_KEYS.assessments.goalsEmptyTitle),
    goalsEmptyMessage: t(I18N_KEYS.assessments.goalsEmptyMessage),
  };
}
