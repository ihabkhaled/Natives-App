import { assert, describe, expect, it } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';
import { PERMISSIONS } from '@/shared/security';
import {
  buildMyMeasurementsResponse,
  buildMyScoreResponse,
} from '@/tests/msw/assessments-insights.fixture';

import { mapMeasurementHistory } from '../mappers/measurements.mapper';
import { measurementHistoryResponseSchema } from '../schemas/measurements.schema';
import { scoreListResponseSchema } from '../schemas/scoring.schema';
import { mapMyPerformanceScore } from '../mappers/scoring.mapper';
import {
  buildMeasurementsPanel,
  buildPerformanceTabs,
  buildScoreCardView,
  resolveActivePerformanceTab,
  resolveTabPath,
} from './self-insights-view.helper';

const t = (key: string, params?: object): string =>
  params === undefined ? key : `${key}|${JSON.stringify(params)}`;

const SELF_GRANTS = [
  PERMISSIONS.assessmentReadSelfPublished,
  PERMISSIONS.analyticsReadSelf,
  PERMISSIONS.feedbackReadSelf,
];

describe('resolveActivePerformanceTab', () => {
  it('maps each deep link onto its tab and defaults to scores', () => {
    expect(resolveActivePerformanceTab('/performance')).toBe('scores');
    expect(resolveActivePerformanceTab('/performance/measurements')).toBe('measurements');
    expect(resolveActivePerformanceTab('/performance/feedback')).toBe('feedback');
    expect(resolveActivePerformanceTab('/somewhere-else')).toBe('scores');
  });
});

describe('resolveTabPath', () => {
  const tabs = buildPerformanceTabs(t, SELF_GRANTS);

  it('navigates to a different permitted tab', () => {
    expect(resolveTabPath(tabs, 'scores', 'feedback')).toBe('/performance/feedback');
  });

  it('ignores echoes of the active tab and ids outside the permitted set', () => {
    expect(resolveTabPath(tabs, 'scores', 'scores')).toBeNull();
    expect(resolveTabPath(tabs, 'scores', 'nonsense')).toBeNull();
  });
});

describe('buildPerformanceTabs', () => {
  it('offers all three tabs to a fully-granted member', () => {
    expect(buildPerformanceTabs(t, SELF_GRANTS).map((tab) => tab.id)).toEqual([
      'scores',
      'measurements',
      'feedback',
    ]);
  });

  it('hides the tabs whose target routes the viewer cannot open', () => {
    expect(buildPerformanceTabs(t, []).map((tab) => tab.id)).toEqual(['scores']);
    expect(buildPerformanceTabs(t, [PERMISSIONS.feedbackReadSelf]).map((tab) => tab.id)).toEqual([
      'scores',
      'feedback',
    ]);
  });
});

describe('buildScoreCardView', () => {
  const score = mapMyPerformanceScore(scoreListResponseSchema.parse(buildMyScoreResponse()));

  it('presents the value, badges, rule reference, and component rows', () => {
    const view = buildScoreCardView({ t, score, isLoading: false, error: null });

    expect(view.valueText).toBe('78.4');
    expect(view.hasValue).toBe(true);
    expect(view.confidenceValue).toBe('assessments.scoreConfidenceHigh');
    expect(view.completenessText).toBe('80%');
    expect(view.ruleReference).toContain('overall-2026');
    expect(view.components[0]?.label).toBe('assessments.scoreCategoryTechnical');
    expect(view.components[1]?.valueText).toBe('assessments.scoreExcludedValue');
  });

  it('says "not computed yet" for a null score and for a null value', () => {
    assert(score !== null);
    const empty = buildScoreCardView({ t, score: null, isLoading: false, error: null });
    expect(empty.valueText).toBe('assessments.scoreNotComputed');
    expect(empty.hasValue).toBe(false);
    expect(empty.components).toEqual([]);

    const uncomputed = buildScoreCardView({
      t,
      score: { ...score, value: null },
      isLoading: false,
      error: null,
    });
    expect(uncomputed.valueText).toBe('assessments.scoreNotComputed');
    expect(uncomputed.hasValue).toBe(false);
  });

  it('carries the loading flag and a sanitized failure message', () => {
    const view = buildScoreCardView({
      t,
      score: undefined,
      isLoading: true,
      error: new AppError({ code: APP_ERROR_CODE.Server }),
    });

    expect(view.isLoading).toBe(true);
    expect(view.unavailableMessage).toBe('errors.server');
  });

  it('never crashes on an unknown category key', () => {
    assert(score !== null);
    const withUnknown = {
      ...score,
      components: [{ categoryKey: 'mystery', weight: 1, display: 2, included: true }],
    };
    const view = buildScoreCardView({ t, score: withUnknown, isLoading: false, error: null });

    expect(view.components[0]?.label).toBe('assessments.scoreComponentColumn');
  });
});

describe('buildMeasurementsPanel', () => {
  const history = mapMeasurementHistory(
    measurementHistoryResponseSchema.parse(buildMyMeasurementsResponse()),
  );

  it('builds one charted protocol view with unit, range, and summary', () => {
    const panel = buildMeasurementsPanel({
      t,
      locale: 'en',
      history,
      isLoading: false,
      error: null,
    });

    const [protocol] = panel.protocols;
    assert(protocol !== undefined);
    expect(protocol.unitLabel).toContain('assessments.measureUnitSeconds');
    expect(protocol.rangeLabel).toContain('assessments.measurementsRangeLabel');
    expect(protocol.summaryText).toContain('assessments.measureMethodBest');
    expect(protocol.chart.title).toBe('20m sprint');
    expect(protocol.chart.hasGap).toBe(true);
    expect(protocol.chart.rows[1]?.valueText).toBe('assessments.measurementsInvalidValue');
    expect(protocol.chart.linePath).not.toBe('');
  });

  it('keeps the low-data notice and no range for a single attempt', () => {
    const single = history.map((protocol) => ({
      ...protocol,
      selected: null,
      attempts: protocol.attempts.slice(0, 1),
    }));
    const panel = buildMeasurementsPanel({
      t,
      locale: 'en',
      history: single,
      isLoading: false,
      error: null,
    });

    expect(panel.protocols[0]?.rangeLabel).toBeNull();
    expect(panel.protocols[0]?.chart.lowDataNotice).toBe('assessments.chartLowData');
    expect(panel.protocols[0]?.summaryText).toContain('assessments.chartNoValue');
  });

  it('renders honest empty, loading, and unavailable shells', () => {
    const empty = buildMeasurementsPanel({
      t,
      locale: 'en',
      history: undefined,
      isLoading: false,
      error: null,
    });
    expect(empty.protocols).toEqual([]);
    expect(empty.emptyTitle).toBe('assessments.measurementsEmpty');

    const failed = buildMeasurementsPanel({
      t,
      locale: 'en',
      history: undefined,
      isLoading: true,
      error: new AppError({ code: APP_ERROR_CODE.Server }),
    });
    expect(failed.isLoading).toBe(true);
    expect(failed.unavailableMessage).toBe('assessments.measurementsUnavailable');
  });

  it('falls back to the raw unit code for a unit outside the catalog', () => {
    const exotic = history.map((protocol) => ({ ...protocol, unit: 'furlongs' }));
    const panel = buildMeasurementsPanel({
      t,
      locale: 'en',
      history: exotic,
      isLoading: false,
      error: null,
    });

    expect(panel.protocols[0]?.unitLabel).toContain('furlongs');
  });
});
