import { describe, expect, it } from 'vitest';

import type { CohortComparison } from '../types/analytics.types';
import { buildCohortBody } from './cohort-view.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;

function cohort(overrides: Partial<CohortComparison>): CohortComparison {
  return {
    dimension: 'attendance',
    periodKey: '2026-04',
    sampleSize: 20,
    suppressed: false,
    average: 0.72,
    minimum: 0.48,
    maximum: 0.95,
    ...overrides,
  };
}

describe('buildCohortBody', () => {
  it('renders min/avg/max tiles and the sample size when not suppressed', () => {
    const body = buildCohortBody(t, cohort({}));
    expect(body.tiles).toHaveLength(3);
    expect(body.tiles.map((tile) => tile.value)).toEqual(['0.48', '0.72', '0.95']);
    expect(body.sampleLabel).toContain('analytics.cohortSampleSize');
    expect(body.suppressedTitle).toBeNull();
  });

  it('replaces the tiles with a privacy notice when suppressed', () => {
    const body = buildCohortBody(
      t,
      cohort({ suppressed: true, sampleSize: 3, average: null, minimum: null, maximum: null }),
    );
    expect(body.tiles).toHaveLength(0);
    expect(body.sampleLabel).toBeNull();
    expect(body.suppressedTitle).toBe('analytics.cohortSuppressedTitle');
    expect(body.suppressedMessage).toContain('analytics.cohortSuppressedMessage');
  });

  it('renders a null stat as an em dash within an unsuppressed cohort', () => {
    const body = buildCohortBody(t, cohort({ average: null }));
    expect(body.tiles[1]?.value).toBe('—');
  });
});
