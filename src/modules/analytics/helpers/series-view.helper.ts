import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  ANALYTICS_PERIOD_TYPES,
  DIMENSION_GROUPS,
  TEAM_ONLY_DIMENSIONS,
  type AnalyticsDimension,
  type AnalyticsDirection,
  type AnalyticsPeriodType,
  type AnalyticsUnit,
} from '../constants/analytics.constants';
import type { AnalyticsSeries } from '../types/analytics.types';
import type {
  AnalyticsControlsView,
  SeriesChartView,
  SeriesTableRow,
} from '../types/analytics-view.types';
import { buildSeriesChartGeometry } from './series-chart.helper';
import { formatComputedAt } from './freshness.helper';

type Translate = (key: string, params?: TranslateParams) => string;

const DIMENSION_KEYS: Readonly<Record<AnalyticsDimension, string>> = {
  technical: I18N_KEYS.analytics.dimensionTechnical,
  tactical: I18N_KEYS.analytics.dimensionTactical,
  physical: I18N_KEYS.analytics.dimensionPhysical,
  psychological: I18N_KEYS.analytics.dimensionPsychological,
  behavioral: I18N_KEYS.analytics.dimensionBehavioral,
  attendance: I18N_KEYS.analytics.dimensionAttendance,
  consistency: I18N_KEYS.analytics.dimensionConsistency,
  offense: I18N_KEYS.analytics.dimensionOffense,
  defense: I18N_KEYS.analytics.dimensionDefense,
  match_involvement: I18N_KEYS.analytics.dimensionMatchInvolvement,
  overall: I18N_KEYS.analytics.dimensionOverall,
  roster_coverage: I18N_KEYS.analytics.dimensionRosterCoverage,
  training_volume: I18N_KEYS.analytics.dimensionTrainingVolume,
  assessment_coverage: I18N_KEYS.analytics.dimensionAssessmentCoverage,
  points: I18N_KEYS.analytics.dimensionPoints,
};

const PERIOD_KEYS: Readonly<Record<AnalyticsPeriodType, string>> = {
  daily: I18N_KEYS.analytics.periodDaily,
  session: I18N_KEYS.analytics.periodSession,
  monthly: I18N_KEYS.analytics.periodMonthly,
  period: I18N_KEYS.analytics.periodPeriod,
  season: I18N_KEYS.analytics.periodSeason,
  all_time: I18N_KEYS.analytics.periodAllTime,
};

const UNIT_KEYS: Readonly<Record<AnalyticsUnit, string>> = {
  count: I18N_KEYS.analytics.unitCount,
  ratio: I18N_KEYS.analytics.unitRatio,
  points: I18N_KEYS.analytics.unitPoints,
  score: I18N_KEYS.analytics.unitScore,
  minutes: I18N_KEYS.analytics.unitMinutes,
};

const DIRECTION_KEYS: Readonly<Record<AnalyticsDirection, string>> = {
  higher_better: I18N_KEYS.analytics.directionHigherBetter,
  lower_better: I18N_KEYS.analytics.directionLowerBetter,
  neutral: I18N_KEYS.analytics.directionNeutral,
};

/** The translated dimension label. */
function resolveDimensionLabel(t: Translate, dimension: AnalyticsDimension): string {
  return t(DIMENSION_KEYS[dimension]);
}

/** The translated period-type label. */
export function resolvePeriodTypeLabel(t: Translate, periodType: AnalyticsPeriodType): string {
  return t(PERIOD_KEYS[periodType]);
}

/** The localized axis unit. */
function resolveUnitLabel(t: Translate, unit: AnalyticsUnit): string {
  return t(UNIT_KEYS[unit]);
}

/** The direction legend — words, never colour alone. */
function resolveDirectionLegend(t: Translate, direction: AnalyticsDirection): string {
  return t(DIRECTION_KEYS[direction]);
}

const GROUP_LABEL_KEYS: Readonly<Record<(typeof DIMENSION_GROUPS)[number]['key'], string>> = {
  teamHealth: I18N_KEYS.analytics.dimensionGroupTeamHealth,
  performance: I18N_KEYS.analytics.dimensionGroupPerformance,
  match: I18N_KEYS.analytics.dimensionGroupMatch,
};

/**
 * The grouped dimension picker + period segment both screens share. Player
 * screens exclude team-only dimensions (roster coverage, training volume,
 * assessment coverage) — applicability is data, not a special case.
 */
export function buildAnalyticsControls(
  t: Translate,
  input: {
    readonly dimension: AnalyticsDimension;
    readonly periodType: AnalyticsPeriodType;
    readonly includeTeamOnly: boolean;
    readonly onDimensionChange: (value: string) => void;
    readonly onPeriodChange: (value: string) => void;
  },
): AnalyticsControlsView {
  return {
    dimensionLabel: t(I18N_KEYS.analytics.dimensionLabel),
    dimensionValue: input.dimension,
    dimensionGroups: DIMENSION_GROUPS.map((group) => {
      const dimensions = input.includeTeamOnly
        ? group.dimensions
        : group.dimensions.filter((dimension) => !TEAM_ONLY_DIMENSIONS.includes(dimension));
      return {
        key: group.key,
        label: t(GROUP_LABEL_KEYS[group.key]),
        options: dimensions.map((dimension) => ({
          value: dimension,
          label: resolveDimensionLabel(t, dimension),
        })),
      };
    }),
    onDimensionChange: input.onDimensionChange,
    periodLabel: t(I18N_KEYS.analytics.periodLabel),
    periodValue: input.periodType,
    periodOptions: ANALYTICS_PERIOD_TYPES.map((periodType) => ({
      value: periodType,
      label: resolvePeriodTypeLabel(t, periodType),
    })),
    onPeriodChange: input.onPeriodChange,
  };
}

/** The accessible twin's rows: value (or the explicit gap word) + sample size. */
function buildSeriesTableRows(t: Translate, series: AnalyticsSeries): readonly SeriesTableRow[] {
  return series.points.map((point, index) => ({
    key: `${point.periodKey}-${String(index)}`,
    label: point.periodKey,
    valueText:
      point.value === null
        ? t(I18N_KEYS.analytics.chartValueMissing, { sample: String(point.sampleSize) })
        : `${String(point.value)} (${String(point.sampleSize)})`,
  }));
}

/**
 * One rendered series card. The server's `summary` sentence is carried
 * verbatim into the footer along with the benchmark and calculation-version
 * citations — the client explains nothing on its own.
 */
export function buildSeriesChartView(
  t: Translate,
  locale: string,
  series: AnalyticsSeries,
): SeriesChartView {
  const geometry = buildSeriesChartGeometry(series.points);
  return {
    title: resolveDimensionLabel(t, series.dimension),
    description: t(I18N_KEYS.analytics.chartDescription, {
      dimension: resolveDimensionLabel(t, series.dimension),
      period: resolvePeriodTypeLabel(t, series.periodType),
    }),
    geometry,
    unitLabel: resolveUnitLabel(t, series.unit),
    directionLegend: resolveDirectionLegend(t, series.direction),
    gapNotice: geometry.hasGap ? t(I18N_KEYS.analytics.gapNotice) : null,
    summary: series.summary,
    benchmark: t(I18N_KEYS.analytics.benchmarkLabel, { benchmark: series.benchmarkLabel }),
    calculationVersion: t(I18N_KEYS.analytics.calculationVersionLabel, {
      version: series.calculationVersion,
    }),
    computedAt: formatComputedAt(t, locale, series.computedAtIso),
    tableCaption: t(I18N_KEYS.analytics.chartTableCaption),
    tableToggleLabel: t(I18N_KEYS.analytics.chartTableToggle),
    tableColumnLabels: [
      t(I18N_KEYS.analytics.chartColumnPeriod),
      t(I18N_KEYS.analytics.chartColumnValue),
    ],
    tableRows: buildSeriesTableRows(t, series),
  };
}
