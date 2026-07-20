import { describe, expect, it } from 'vitest';

import { CHART_GEOMETRY } from '../constants/assessments.constants';
import type { ChartPoint } from '../types/assessments-view.types';
import {
  buildAreaPath,
  buildAxisTicks,
  buildLinePath,
  buildMarkers,
  pointX,
  pointY,
  radarPoint,
  radarRingRadii,
  resolveBounds,
} from './chart-geometry.helper';

function point(label: string, value: number | null): ChartPoint {
  return { label, value };
}

describe('pointX', () => {
  it('centres a single point', () => {
    expect(pointX(0, 1)).toBe(
      CHART_GEOMETRY.paddingX + (CHART_GEOMETRY.width - CHART_GEOMETRY.paddingX * 2) / 2,
    );
  });

  it('spreads points across the plot width', () => {
    expect(pointX(0, 3)).toBe(CHART_GEOMETRY.paddingX);
    expect(pointX(2, 3)).toBe(CHART_GEOMETRY.width - CHART_GEOMETRY.paddingX);
  });
});

describe('pointY', () => {
  it('flips the axis so the maximum sits at the top', () => {
    expect(pointY(5, 0, 5)).toBe(CHART_GEOMETRY.paddingY);
    expect(pointY(0, 0, 5)).toBe(CHART_GEOMETRY.height - CHART_GEOMETRY.paddingY);
  });

  it('centres a zero-span band', () => {
    const middle = pointY(3, 3, 3);

    expect(middle).toBeGreaterThan(CHART_GEOMETRY.paddingY);
    expect(middle).toBeLessThan(CHART_GEOMETRY.height - CHART_GEOMETRY.paddingY);
  });

  it('clamps values outside the band', () => {
    expect(pointY(9, 0, 5)).toBe(CHART_GEOMETRY.paddingY);
    expect(pointY(-9, 0, 5)).toBe(CHART_GEOMETRY.height - CHART_GEOMETRY.paddingY);
  });
});

describe('buildLinePath', () => {
  it('breaks the line at a gap instead of dropping to the baseline', () => {
    const path = buildLinePath([point('a', 3), point('b', null), point('c', 4)], 0, 5);

    expect(path.split('M')).toHaveLength(3);
    expect(path).not.toContain('L44');
  });

  it('connects consecutive evaluated points', () => {
    const path = buildLinePath([point('a', 3), point('b', 4)], 0, 5);

    expect(path.startsWith('M')).toBe(true);
    expect(path).toContain('L');
  });

  it('produces nothing for a fully unevaluated series', () => {
    expect(buildLinePath([point('a', null)], 0, 5)).toBe('');
  });
});

describe('buildAreaPath', () => {
  it('closes the area under two or more evaluated points', () => {
    const path = buildAreaPath([point('a', 3), point('b', 4)], 0, 5);

    expect(path.endsWith('Z')).toBe(true);
  });

  it('returns nothing when a single point is evaluated', () => {
    expect(buildAreaPath([point('a', 3), point('b', null)], 0, 5)).toBe('');
  });

  it('returns nothing when nothing is evaluated', () => {
    expect(buildAreaPath([point('a', null)], 0, 5)).toBe('');
  });
});

describe('buildMarkers', () => {
  it('emits one marker per evaluated point and none for gaps', () => {
    const markers = buildMarkers([point('a', 3), point('b', null), point('c', 0)], 0, 5);

    expect(markers).toHaveLength(2);
  });
});

describe('buildAxisTicks', () => {
  it('emits one tick per period', () => {
    expect(buildAxisTicks([point('a', 1), point('b', null)])).toHaveLength(2);
  });
});

describe('resolveBounds', () => {
  it('falls back to the score maximum when nothing is evaluated', () => {
    expect(resolveBounds([point('a', null)], 5)).toEqual({ minimum: 0, maximum: 5 });
  });

  it('widens for values above the fallback maximum', () => {
    expect(resolveBounds([point('a', 12)], 5)).toEqual({ minimum: 0, maximum: 12 });
  });

  it('keeps a readable band for a flat series at the fallback', () => {
    expect(resolveBounds([point('a', 0)], 0)).toEqual({ minimum: 0, maximum: 1 });
  });

  it('drops the floor for negative values', () => {
    expect(resolveBounds([point('a', -3)], 5)).toEqual({ minimum: -3, maximum: 5 });
  });
});

describe('radar geometry', () => {
  it('places the first axis directly above the centre', () => {
    const centre = CHART_GEOMETRY.radarSize / 2;
    const top = radarPoint(0, 4, 1);

    expect(top.x).toBeCloseTo(centre, 1);
    expect(top.y).toBeLessThan(centre);
  });

  it('collapses a zero ratio onto the centre', () => {
    const centre = CHART_GEOMETRY.radarSize / 2;

    expect(radarPoint(1, 4, 0)).toEqual({ x: centre, y: centre });
  });

  it('clamps a ratio above one', () => {
    expect(radarPoint(0, 4, 4)).toEqual(radarPoint(0, 4, 1));
  });

  it('guards against a zero axis count', () => {
    expect(Number.isFinite(radarPoint(0, 0, 1).x)).toBe(true);
  });

  it('emits evenly spaced rings', () => {
    expect(radarRingRadii()).toHaveLength(CHART_GEOMETRY.radarRings);
  });
});
