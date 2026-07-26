import { afterEach, describe, expect, it, vi } from 'vitest';

import * as gateway from '../gateways/analytics.gateway';
import { getCohortComparison } from './get-cohort-comparison.service';
import { getPlayerSeries } from './get-player-series.service';
import { getTeamSeries } from './get-team-series.service';
import { rebuildAnalytics } from './rebuild-analytics.service';

vi.mock('../gateways/analytics.gateway');

const seriesDto = {
  seriesId: 's1',
  dimension: 'attendance' as const,
  unit: 'ratio' as const,
  direction: 'higher_better' as const,
  periodType: 'monthly' as const,
  calculationVersion: 'analytics-v1',
  benchmarkLabel: 'Squad median',
  summary: 'Up.',
  points: [{ periodKey: '2026-01', value: 0.6, sampleSize: 18 }],
  computedAt: '2026-07-23T06:00:00.000Z',
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('analytics services', () => {
  it('reads the player and team series', async () => {
    vi.mocked(gateway.requestPlayerSeries).mockResolvedValue(seriesDto);
    vi.mocked(gateway.requestTeamSeries).mockResolvedValue(seriesDto);
    expect(
      (await getPlayerSeries('t1', 'm1', { dimension: 'overall', periodType: 'monthly' })).seriesId,
    ).toBe('s1');
    expect(
      (await getTeamSeries('t1', { dimension: 'attendance', periodType: 'monthly' })).points,
    ).toHaveLength(1);
  });

  it('reads a cohort comparison', async () => {
    vi.mocked(gateway.requestCohortComparison).mockResolvedValue({
      dimension: 'attendance',
      periodKey: '2026-02',
      sampleSize: 3,
      suppressed: true,
      average: null,
      minimum: null,
      maximum: null,
    });
    expect(
      (
        await getCohortComparison('t1', {
          dimension: 'attendance',
          periodType: 'monthly',
          periodKey: '2026-02',
        })
      ).suppressed,
    ).toBe(true);
  });

  it('rebuilds the projections', async () => {
    vi.mocked(gateway.requestRebuildAnalytics).mockResolvedValue({
      seasonId: null,
      periodType: 'monthly',
      calculationVersion: 'analytics-v1',
      subjectsProjected: 22,
      projectionsWritten: 88,
      computedAt: '2026-07-23T09:00:00.000Z',
    });
    expect(
      (await rebuildAnalytics('t1', { periodType: 'monthly', seasonId: null })).subjectsProjected,
    ).toBe(22);
  });
});
