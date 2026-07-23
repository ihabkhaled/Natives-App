import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import type { ChartTableRow } from '@/shared/ui';

import { CHART_GEOMETRY, LEGACY_SCORE_MAXIMUM } from '../constants/assessments.constants';
import type {
  ChartPoint,
  RadarAxisView,
  RadarChartView,
  TrendChartView,
} from '../types/assessments-view.types';
import type {
  AssessmentCatalog,
  MetricDefinition,
  PublishedAssessment,
} from '../types/assessments.types';
import {
  buildTrendGeometry,
  radarPoint,
  radarRingRadii,
  resolveBounds,
} from './chart-geometry.helper';

type Translate = (key: string, params?: TranslateParams) => string;

function periodName(catalog: AssessmentCatalog, periodId: string): string {
  return catalog.periods.find((period) => period.id === periodId)?.name ?? periodId;
}

/** Published assessments ordered oldest → newest by publication instant. */
export function orderByPeriod(
  assessments: readonly PublishedAssessment[],
): readonly PublishedAssessment[] {
  return [...assessments].sort((left, right) =>
    (left.publishedAtIso ?? '').localeCompare(right.publishedAtIso ?? ''),
  );
}

/**
 * One metric across every published period. A period with no value for the
 * metric yields `null` — a gap, never a zero.
 */
export function buildMetricPoints(
  catalog: AssessmentCatalog,
  assessments: readonly PublishedAssessment[],
  metricDefinitionId: string,
): readonly ChartPoint[] {
  return orderByPeriod(assessments).map((assessment) => {
    const value = assessment.values.find(
      (candidate) => candidate.metricDefinitionId === metricDefinitionId,
    );
    return {
      label: periodName(catalog, assessment.periodId),
      value: value === undefined ? null : value.numericValue,
    };
  });
}

function buildRows(t: Translate, points: readonly ChartPoint[]): readonly ChartTableRow[] {
  return points.map((point, index) => ({
    key: `${point.label}-${String(index)}`,
    label: point.label,
    valueText: point.value === null ? t(I18N_KEYS.assessments.chartNoValue) : `${point.value}`,
  }));
}

/**
 * Build the trend chart view model, including its accessible description and
 * the tabular alternative that carries the same numbers as the SVG.
 */
export function buildTrendChartView(
  t: Translate,
  catalog: AssessmentCatalog,
  assessments: readonly PublishedAssessment[],
  metric: MetricDefinition,
): TrendChartView {
  const points = buildMetricPoints(catalog, assessments, metric.id);
  const bounds = resolveBounds(points, LEGACY_SCORE_MAXIMUM);
  const evaluated = points.filter((point) => point.value !== null);
  const title = t(I18N_KEYS.assessments.chartTrendTitle);
  return {
    title,
    description: t(I18N_KEYS.assessments.chartTrendDescription, {
      metric: metric.name,
      count: points.length,
      first: points[0]?.label ?? '',
      last: points.at(-1)?.label ?? '',
    }),
    points,
    ...buildTrendGeometry(points, bounds.minimum, bounds.maximum),
    hasGap: evaluated.length < points.length,
    gapNotice: t(I18N_KEYS.assessments.chartGapNotice),
    lowDataNotice: evaluated.length < 2 ? t(I18N_KEYS.assessments.chartLowData) : null,
    tableCaption: t(I18N_KEYS.assessments.chartTableCaption, { title }),
    tableToggleLabel: t(I18N_KEYS.assessments.chartShowTable),
    columnLabels: [
      t(I18N_KEYS.assessments.chartColumnPeriod),
      t(I18N_KEYS.assessments.chartColumnValue),
    ],
    rows: buildRows(t, points),
  };
}

/**
 * Average the latest published assessment per category. Categories with no
 * evaluated metric are omitted rather than plotted at the origin.
 */
export function buildCategoryAverages(
  catalog: AssessmentCatalog,
  assessment: PublishedAssessment,
): readonly ChartPoint[] {
  const sorted = [...catalog.categories].sort((left, right) => left.sortOrder - right.sortOrder);
  return sorted.map((category) => {
    const metricIds = catalog.metrics
      .filter((metric) => metric.categoryId === category.id)
      .map((metric) => metric.id);
    const values = assessment.values.flatMap((value) =>
      metricIds.includes(value.metricDefinitionId) && value.numericValue !== null
        ? [value.numericValue]
        : [],
    );
    const total = values.reduce((sum, value) => sum + value, 0);
    return {
      label: category.name,
      value: values.length === 0 ? null : Math.round((total / values.length) * 10) / 10,
    };
  });
}

/** Build the radar view model plus its tabular alternative. */
export function buildRadarChartView(
  t: Translate,
  catalog: AssessmentCatalog,
  assessment: PublishedAssessment,
): RadarChartView {
  const points = buildCategoryAverages(catalog, assessment);
  const center = CHART_GEOMETRY.radarSize / 2;
  const polygon = points
    .map((point, index) =>
      radarPoint(index, points.length, (point.value ?? 0) / LEGACY_SCORE_MAXIMUM),
    )
    .map((coordinate) => `${coordinate.x},${coordinate.y}`)
    .join(' ');
  const axes: readonly RadarAxisView[] = points.map((point, index) => {
    const outer = radarPoint(index, points.length, 1.14);
    return { key: `${point.label}-${String(index)}`, label: point.label, x: outer.x, y: outer.y };
  });
  const title = t(I18N_KEYS.assessments.chartRadarTitle);
  return {
    title,
    description: t(I18N_KEYS.assessments.chartRadarDescription, {
      count: points.length,
      max: LEGACY_SCORE_MAXIMUM,
    }),
    polygonPoints: polygon,
    ringRadii: radarRingRadii(),
    axes,
    center,
    size: CHART_GEOMETRY.radarSize,
    tableCaption: t(I18N_KEYS.assessments.chartTableCaption, { title }),
    tableToggleLabel: t(I18N_KEYS.assessments.chartShowTable),
    columnLabels: [
      t(I18N_KEYS.assessments.chartColumnMetric),
      t(I18N_KEYS.assessments.chartColumnValue),
    ],
    rows: buildRows(t, points),
  };
}

/** Metrics that appear in at least one published assessment, name-ordered. */
export function publishedMetrics(
  catalog: AssessmentCatalog,
  assessments: readonly PublishedAssessment[],
): readonly MetricDefinition[] {
  const seen = new Set(
    assessments.flatMap((assessment) => assessment.values.map((value) => value.metricDefinitionId)),
  );
  return catalog.metrics
    .filter((metric) => seen.has(metric.id))
    .sort((left, right) => left.name.localeCompare(right.name));
}
