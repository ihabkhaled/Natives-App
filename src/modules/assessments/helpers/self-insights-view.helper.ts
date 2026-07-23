import { formatCairoDate } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import type { AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

import {
  performanceFeedbackPath,
  performanceMeasurementsPath,
  performancePath,
} from '../routes/assessments.paths';
import { buildTrendGeometry, resolveBounds } from './chart-geometry.helper';
import type {
  ChartPoint,
  MeasurementProtocolView,
  MeasurementsPanelView,
  PerformanceScoreCardView,
  PerformanceTabId,
  PerformanceTabView,
  TrendChartView,
} from '../types/assessments-view.types';
import type { MeasurementProtocolHistory, MyPerformanceScore } from '../types/assessments.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** Which tab a deep link opened; unknown paths land on the scores tab. */
export function resolveActivePerformanceTab(currentPath: string): PerformanceTabId {
  if (currentPath === performanceMeasurementsPath()) {
    return 'measurements';
  }
  return currentPath === performanceFeedbackPath() ? 'feedback' : 'scores';
}

/**
 * The path a segment change should navigate to, or null for an echo of the
 * already-active tab or an id outside the permitted set.
 */
export function resolveTabPath(
  tabs: readonly PerformanceTabView[],
  activeTab: PerformanceTabId,
  tabId: string,
): string | null {
  const next = tabs.find((tab) => tab.id === tabId);
  if (next === undefined || next.id === activeTab) {
    return null;
  }
  return next.path;
}

/** Only tabs the viewer may actually open render; scores always does. */
export function buildPerformanceTabs(
  t: Translate,
  permissions: readonly string[],
): readonly PerformanceTabView[] {
  const tabs: PerformanceTabView[] = [
    { id: 'scores', label: t(I18N_KEYS.assessments.tabScores), path: performancePath() },
  ];
  if (hasAllPermissions(permissions, [PERMISSIONS.analyticsReadSelf])) {
    tabs.push({
      id: 'measurements',
      label: t(I18N_KEYS.assessments.tabMeasurements),
      path: performanceMeasurementsPath(),
    });
  }
  if (hasAllPermissions(permissions, [PERMISSIONS.feedbackReadSelf])) {
    tabs.push({
      id: 'feedback',
      label: t(I18N_KEYS.assessments.tabFeedback),
      path: performanceFeedbackPath(),
    });
  }
  return tabs;
}

const CONFIDENCE_KEYS: Record<MyPerformanceScore['confidence'], I18nKey> = {
  none: I18N_KEYS.assessments.scoreConfidenceNone,
  low: I18N_KEYS.assessments.scoreConfidenceLow,
  medium: I18N_KEYS.assessments.scoreConfidenceMedium,
  high: I18N_KEYS.assessments.scoreConfidenceHigh,
};

const CATEGORY_KEYS: Record<string, I18nKey> = {
  training: I18N_KEYS.assessments.scoreCategoryTraining,
  technical: I18N_KEYS.assessments.scoreCategoryTechnical,
  tactical: I18N_KEYS.assessments.scoreCategoryTactical,
  physical: I18N_KEYS.assessments.scoreCategoryPhysical,
  psychological: I18N_KEYS.assessments.scoreCategoryPsychological,
  behavioral: I18N_KEYS.assessments.scoreCategoryBehavioral,
  attendance: I18N_KEYS.assessments.scoreCategoryAttendance,
};

export interface BuildScoreCardParams {
  readonly t: Translate;
  readonly score: MyPerformanceScore | null | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
}

/** The own-score card; null when the section should not render at all. */
export function buildScoreCardView(params: BuildScoreCardParams): PerformanceScoreCardView {
  const { t, score } = params;
  const shared = {
    title: t(I18N_KEYS.assessments.scoreCardTitle),
    confidenceLabel: t(I18N_KEYS.assessments.scoreConfidenceLabel),
    completenessLabel: t(I18N_KEYS.assessments.scoreCompletenessLabel),
    explanationTitle: t(I18N_KEYS.assessments.scoreExplanationTitle),
    componentColumns: [
      t(I18N_KEYS.assessments.scoreComponentColumn),
      t(I18N_KEYS.assessments.scoreWeightColumn),
      t(I18N_KEYS.assessments.scoreValueColumn),
    ],
    isLoading: params.isLoading,
    loadingLabel: t(I18N_KEYS.common.loading),
    unavailableMessage: params.error === null ? null : t(mapErrorCodeToI18nKey(params.error.code)),
  };
  if (score === undefined || score === null) {
    return {
      ...shared,
      valueText: t(I18N_KEYS.assessments.scoreNotComputed),
      hasValue: false,
      confidenceValue: '',
      completenessText: '',
      ruleReference: '',
      components: [],
    };
  }
  const hasValue = score.value !== null;
  return {
    ...shared,
    valueText: hasValue ? String(score.value) : t(I18N_KEYS.assessments.scoreNotComputed),
    hasValue,
    confidenceValue: t(CONFIDENCE_KEYS[score.confidence]),
    completenessText: `${String(Math.round(score.completeness * 100))}%`,
    ruleReference: t(I18N_KEYS.assessments.scoreRuleReference, {
      rule: score.ruleKey,
      version: score.ruleVersion,
    }),
    components: score.components.map((component) => ({
      key: component.categoryKey,
      label: t(CATEGORY_KEYS[component.categoryKey] ?? I18N_KEYS.assessments.scoreComponentColumn),
      weightText: String(component.weight),
      valueText:
        component.included && component.display !== null
          ? String(component.display)
          : t(I18N_KEYS.assessments.scoreExcludedValue),
    })),
  };
}

const UNIT_KEYS: Record<string, I18nKey> = {
  seconds: I18N_KEYS.assessments.measureUnitSeconds,
  milliseconds: I18N_KEYS.assessments.measureUnitMilliseconds,
  meters: I18N_KEYS.assessments.measureUnitMeters,
  centimeters: I18N_KEYS.assessments.measureUnitCentimeters,
  kilograms: I18N_KEYS.assessments.measureUnitKilograms,
  meters_per_second: I18N_KEYS.assessments.measureUnitMetersPerSecond,
  count: I18N_KEYS.assessments.measureUnitCount,
  level: I18N_KEYS.assessments.measureUnitLevel,
  percent: I18N_KEYS.assessments.measureUnitPercent,
};

const METHOD_KEYS: Record<MeasurementProtocolHistory['method'], I18nKey> = {
  best: I18N_KEYS.assessments.measureMethodBest,
  average: I18N_KEYS.assessments.measureMethodAverage,
  latest: I18N_KEYS.assessments.measureMethodLatest,
};

function unitLabel(t: Translate, unit: string): string {
  const key = UNIT_KEYS[unit];
  return key === undefined ? unit : t(key);
}

function buildProtocolChart(
  t: Translate,
  protocol: MeasurementProtocolHistory,
  points: readonly ChartPoint[],
  summaryText: string,
): TrendChartView {
  const evaluated = points.filter((point) => point.value !== null);
  const bounds = resolveBounds(points, 1);
  return {
    title: protocol.name,
    description: summaryText,
    points,
    ...buildTrendGeometry(points, bounds.minimum, bounds.maximum),
    hasGap: evaluated.length < points.length,
    gapNotice: t(I18N_KEYS.assessments.chartGapNotice),
    lowDataNotice: evaluated.length < 2 ? t(I18N_KEYS.assessments.chartLowData) : null,
    tableCaption: t(I18N_KEYS.assessments.chartTableCaption, { title: protocol.name }),
    tableToggleLabel: t(I18N_KEYS.assessments.chartShowTable),
    columnLabels: [
      t(I18N_KEYS.assessments.measurementsAttemptColumn),
      t(I18N_KEYS.assessments.measurementsValueColumn),
    ],
    rows: points.map((point, index) => ({
      key: `${point.label}-${String(index)}`,
      label: point.label,
      valueText:
        point.value === null
          ? t(I18N_KEYS.assessments.measurementsInvalidValue)
          : String(point.value),
    })),
  };
}

function buildProtocolView(
  t: Translate,
  locale: string,
  protocol: MeasurementProtocolHistory,
): MeasurementProtocolView {
  const points: ChartPoint[] = protocol.attempts.map((attempt) => ({
    label: formatCairoDate(attempt.recordedAtIso, locale),
    value: attempt.isCountable ? attempt.canonicalValue : null,
  }));
  const summaryText = t(I18N_KEYS.assessments.measurementsTextSummary, {
    count: protocol.consideredCount,
    method: t(METHOD_KEYS[protocol.method]),
    value: protocol.selected ?? t(I18N_KEYS.assessments.chartNoValue),
    unit: unitLabel(t, protocol.unit),
  });
  const first = points[0];
  const last = points.at(-1);
  return {
    protocolId: protocol.protocolId,
    unitLabel: t(I18N_KEYS.assessments.measurementsUnitLabel, {
      unit: unitLabel(t, protocol.unit),
    }),
    rangeLabel:
      first === undefined || last === undefined || points.length < 2
        ? null
        : t(I18N_KEYS.assessments.measurementsRangeLabel, { from: first.label, to: last.label }),
    summaryText,
    chart: buildProtocolChart(t, protocol, points, summaryText),
  };
}

export interface BuildMeasurementsPanelParams {
  readonly t: Translate;
  readonly locale: string;
  readonly history: readonly MeasurementProtocolHistory[] | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
}

/** The measurements tab body: per-protocol charts or the honest empty state. */
export function buildMeasurementsPanel(
  params: BuildMeasurementsPanelParams,
): MeasurementsPanelView {
  const { t } = params;
  return {
    title: t(I18N_KEYS.assessments.measurementsTitle),
    emptyTitle: t(I18N_KEYS.assessments.measurementsEmpty),
    emptyMessage: t(I18N_KEYS.assessments.measurementsEmptyHint),
    isLoading: params.isLoading,
    loadingLabel: t(I18N_KEYS.common.loading),
    unavailableMessage:
      params.error === null ? null : t(I18N_KEYS.assessments.measurementsUnavailable),
    protocols: (params.history ?? []).map((protocol) =>
      buildProtocolView(t, params.locale, protocol),
    ),
  };
}
