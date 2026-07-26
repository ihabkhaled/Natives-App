import { describe, expect, it } from 'vitest';

import type { AnalyticsSeriesPoint } from '../types/analytics.types';
import {
  buildSeriesChartGeometry,
  buildSeriesLinePath,
  buildSeriesMarkers,
  resolveSeriesBounds,
  scaleSeriesPoints,
} from './series-chart.helper';

function point(periodKey: string, value: number | null): AnalyticsSeriesPoint {
  return { periodKey, value, sampleSize: 10 };
}

describe('resolveSeriesBounds', () => {
  it('returns a unit band for an empty or all-null series', () => {
    expect(resolveSeriesBounds([])).toEqual({ lowest: 0, highest: 1 });
    expect(resolveSeriesBounds([point('a', null)])).toEqual({ lowest: 0, highest: 1 });
  });

  it('pads a flat series into a readable band', () => {
    expect(resolveSeriesBounds([point('a', 5), point('b', 5)])).toEqual({
      lowest: 4.5,
      highest: 5.5,
    });
  });

  it('pads a varied series by a tenth of the span', () => {
    const bounds = resolveSeriesBounds([point('a', 0), point('b', 10)]);
    expect(bounds.lowest).toBe(-1);
    expect(bounds.highest).toBe(11);
  });
});

describe('scaleSeriesPoints', () => {
  it('centres a single point and keeps nulls unplotted', () => {
    const scaled = scaleSeriesPoints([point('only', 5)]);
    expect(scaled[0]?.y).not.toBeNull();
    const withGap = scaleSeriesPoints([point('a', 5), point('b', null)]);
    expect(withGap[1]?.y).toBeNull();
  });
});

describe('buildSeriesLinePath', () => {
  it('breaks the line at a null value instead of dropping to zero', () => {
    const scaled = scaleSeriesPoints([point('a', 5), point('b', null), point('c', 7)]);
    const path = buildSeriesLinePath(scaled);
    // Two move commands (one per evaluated run) prove the gap breaks the line.
    expect(path.match(/M/gu)?.length).toBe(2);
  });

  it('is empty for an all-null series', () => {
    expect(buildSeriesLinePath(scaleSeriesPoints([point('a', null)]))).toBe('');
    expect(buildSeriesMarkers(scaleSeriesPoints([point('a', null)]))).toHaveLength(0);
  });
});

describe('buildSeriesChartGeometry', () => {
  it('reports a gap and draws a marker only for evaluated points', () => {
    const geometry = buildSeriesChartGeometry([point('a', 5), point('b', null), point('c', 7)]);
    expect(geometry.hasGap).toBe(true);
    expect(geometry.markers).toHaveLength(2);
  });

  it('emits at most a bounded number of axis ticks for a long series', () => {
    const points = Array.from({ length: 30 }, (_unused, index) =>
      point(`2026-${String(index)}`, index),
    );
    const geometry = buildSeriesChartGeometry(points);
    expect(geometry.hasGap).toBe(false);
    expect(geometry.ticks.length).toBeLessThanOrEqual(6);
    // The first and last period always keep a tick.
    expect(geometry.ticks.at(0)?.label).toBe('2026-0');
    expect(geometry.ticks.at(-1)?.label).toBe('2026-29');
  });

  it('labels every point when the series is short', () => {
    const geometry = buildSeriesChartGeometry([point('a', 1), point('b', 2)]);
    expect(geometry.ticks).toHaveLength(2);
  });
});
