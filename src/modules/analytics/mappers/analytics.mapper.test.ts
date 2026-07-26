import { describe, expect, it } from 'vitest';

import { mapAnalyticsSeries, mapCohortComparison, mapRebuildReport } from './analytics.mapper';

describe('mapAnalyticsSeries', () => {
  it('preserves the null gap and the server summary verbatim', () => {
    const series = mapAnalyticsSeries({
      seriesId: 's1',
      dimension: 'attendance',
      unit: 'ratio',
      direction: 'higher_better',
      periodType: 'monthly',
      calculationVersion: 'analytics-v1',
      benchmarkLabel: 'Squad median',
      summary: 'Attendance rose.',
      points: [
        { periodKey: '2026-01', value: 0.6, sampleSize: 18 },
        { periodKey: '2026-02', value: null, sampleSize: 3 },
      ],
      computedAt: '2026-07-23T06:00:00.000Z',
    });
    expect(series.points[1]?.value).toBeNull();
    expect(series.summary).toBe('Attendance rose.');
    expect(series.computedAtIso).toBe('2026-07-23T06:00:00.000Z');
  });

  it('keeps an uncomputed series computedAt null', () => {
    const series = mapAnalyticsSeries({
      seriesId: 's1',
      dimension: 'overall',
      unit: 'score',
      direction: 'neutral',
      periodType: 'season',
      calculationVersion: 'analytics-v1',
      benchmarkLabel: '',
      summary: '',
      points: [],
      computedAt: null,
    });
    expect(series.computedAtIso).toBeNull();
  });
});

describe('mapCohortComparison', () => {
  it('keeps suppression and null stats intact', () => {
    const cohort = mapCohortComparison({
      dimension: 'attendance',
      periodKey: '2026-02',
      sampleSize: 3,
      suppressed: true,
      average: null,
      minimum: null,
      maximum: null,
    });
    expect(cohort.suppressed).toBe(true);
    expect(cohort.average).toBeNull();
  });
});

describe('mapRebuildReport', () => {
  it('maps the reconciliation report', () => {
    const report = mapRebuildReport({
      seasonId: null,
      periodType: 'monthly',
      calculationVersion: 'analytics-v1',
      subjectsProjected: 22,
      projectionsWritten: 88,
      computedAt: '2026-07-23T09:00:00.000Z',
    });
    expect(report).toMatchObject({
      subjectsProjected: 22,
      projectionsWritten: 88,
      computedAtIso: '2026-07-23T09:00:00.000Z',
    });
  });
});
