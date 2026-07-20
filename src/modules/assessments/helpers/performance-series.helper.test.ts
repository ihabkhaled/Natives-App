import { describe, expect, it } from 'vitest';

import {
  buildAssessmentCatalog,
  buildMetricDefinition,
  buildPublishedAssessment,
} from '../../../../tests/factories/assessments.factory';
import {
  buildCategoryAverages,
  buildMetricPoints,
  buildRadarChartView,
  buildTrendChartView,
  orderByPeriod,
  publishedMetrics,
} from './performance-series.helper';

const t = (key: string): string => key;
const CATALOG = buildAssessmentCatalog();
const SPRING = buildPublishedAssessment({
  id: 'asmt-published-0',
  periodId: 'period-spring-2026',
  publishedAtIso: '2026-05-20T12:00:00.000Z',
  values: [{ metricDefinitionId: 'metric-speed', numericValue: 3, textValue: null }],
});
const SUMMER = buildPublishedAssessment();

describe('orderByPeriod', () => {
  it('orders oldest to newest by publication instant', () => {
    expect(orderByPeriod([SUMMER, SPRING]).map((entry) => entry.id)).toEqual([
      'asmt-published-0',
      'asmt-published-1',
    ]);
  });

  it('treats an unevaluated publication instant as the oldest on either side', () => {
    const unpublished = buildPublishedAssessment({ id: 'asmt-x', publishedAtIso: null });

    expect(orderByPeriod([unpublished, SUMMER])[0]?.id).toBe('asmt-x');
  });

  it('tolerates a missing publication instant', () => {
    const unpublished = buildPublishedAssessment({ id: 'asmt-x', publishedAtIso: null });

    expect(orderByPeriod([SUMMER, unpublished])[0]?.id).toBe('asmt-x');
  });
});

describe('buildMetricPoints', () => {
  it('reports a period without the metric as a gap, never as zero', () => {
    const points = buildMetricPoints(CATALOG, [SPRING, SUMMER], 'metric-attitude');

    expect(points[0]).toEqual({ label: 'Spring 2026', value: null });
    expect(points[1]).toEqual({ label: 'Summer 2026', value: 0 });
  });

  it('falls back to the period id when the catalog lacks the period', () => {
    const orphan = buildPublishedAssessment({ periodId: 'period-unknown' });

    expect(buildMetricPoints(CATALOG, [orphan], 'metric-speed')[0]?.label).toBe('period-unknown');
  });
});

describe('buildTrendChartView', () => {
  it('carries a description, a table alternative, and a gap notice', () => {
    const view = buildTrendChartView(
      t,
      CATALOG,
      [SPRING, SUMMER],
      buildMetricDefinition({
        id: 'metric-attitude',
        name: 'Attitude',
      }),
    );

    expect(view.description).toBe('assessments.chartTrendDescription');
    expect(view.rows).toHaveLength(2);
    expect(view.rows[0]?.valueText).toBe('assessments.chartNoValue');
    expect(view.rows[1]?.valueText).toBe('0');
    expect(view.hasGap).toBe(true);
    expect(view.columnLabels).toHaveLength(2);
  });

  it('flags a single evaluated period as low data', () => {
    const view = buildTrendChartView(t, CATALOG, [SPRING], buildMetricDefinition());

    expect(view.lowDataNotice).toBe('assessments.chartLowData');
  });

  it('drops the low-data notice once two periods are evaluated', () => {
    const view = buildTrendChartView(t, CATALOG, [SPRING, SUMMER], buildMetricDefinition());

    expect(view.lowDataNotice).toBeNull();
    expect(view.hasGap).toBe(false);
  });
});

describe('buildCategoryAverages', () => {
  it('averages evaluated metrics per category and leaves empty categories null', () => {
    const averages = buildCategoryAverages(CATALOG, SUMMER);

    expect(averages).toEqual([
      { label: 'Athletic', value: 4 },
      { label: 'Mental', value: 0 },
    ]);
  });

  it('reports a category with no evaluated metric as not evaluated', () => {
    const averages = buildCategoryAverages(CATALOG, SPRING);

    expect(averages[1]).toEqual({ label: 'Mental', value: null });
  });
});

describe('buildRadarChartView', () => {
  it('ships polygon geometry plus the same numbers in a table', () => {
    const view = buildRadarChartView(t, CATALOG, SUMMER);

    expect(view.polygonPoints.split(' ')).toHaveLength(2);
    expect(view.axes).toHaveLength(2);
    expect(view.rows.map((row) => row.valueText)).toEqual(['4', '0']);
    expect(view.ringRadii.length).toBeGreaterThan(0);
  });
});

describe('edge cases', () => {
  it('reports an empty trend when nothing is published at all', () => {
    const view = buildTrendChartView(t, CATALOG, [], buildMetricDefinition());

    expect(view.points).toEqual([]);
    expect(view.linePath).toBe('');
    expect(view.hasGap).toBe(false);
    expect(view.description).toBe('assessments.chartTrendDescription');
  });

  it('averages several metrics in one category', () => {
    const multi = buildPublishedAssessment({
      values: [
        { metricDefinitionId: 'metric-attitude', numericValue: 4, textValue: null },
        { metricDefinitionId: 'metric-notes', numericValue: 1, textValue: null },
      ],
    });

    expect(buildCategoryAverages(CATALOG, multi)[1]).toEqual({
      label: 'Mental',
      value: 2.5,
    });
  });

  it('reports an unevaluated category in the radar table, never as a zero', () => {
    const view = buildRadarChartView(t, CATALOG, SPRING);

    expect(view.rows[1]?.valueText).toBe('assessments.chartNoValue');
  });
});

describe('publishedMetrics', () => {
  it('lists only metrics that appear in a published assessment, name-ordered', () => {
    expect(publishedMetrics(CATALOG, [SUMMER]).map((metric) => metric.name)).toEqual([
      'Attitude',
      'Speed',
    ]);
  });

  it('returns nothing when no assessment is published', () => {
    expect(publishedMetrics(CATALOG, [])).toEqual([]);
  });
});
