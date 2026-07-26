import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCohortComparison } from '../services/get-cohort-comparison.service';
import { getPlayerSeries } from '../services/get-player-series.service';
import { getTeamSeries } from '../services/get-team-series.service';
import { analyticsQueryKeys } from './analytics.keys';
import {
  buildCohortComparisonQueryOptions,
  buildPlayerSeriesQueryOptions,
  buildTeamSeriesQueryOptions,
} from './analytics.query';

vi.mock('../services/get-team-series.service', () => ({ getTeamSeries: vi.fn() }));
vi.mock('../services/get-player-series.service', () => ({ getPlayerSeries: vi.fn() }));
vi.mock('../services/get-cohort-comparison.service', () => ({ getCohortComparison: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('analyticsQueryKeys', () => {
  it('builds stable, team-scoped keys', () => {
    expect(analyticsQueryKeys.teamSeries('t', 'attendance', 'monthly')).toContain('team-series');
    expect(analyticsQueryKeys.playerSeries('t', 'm', 'overall', 'monthly')).toContain(
      'player-series',
    );
    expect(analyticsQueryKeys.cohort('t', 'attendance', 'monthly', '2026-04')).toContain('cohort');
  });
});

describe('analytics query options', () => {
  it('gates the reads on their scope', () => {
    expect(
      buildTeamSeriesQueryOptions('', { dimension: 'attendance', periodType: 'monthly' }).enabled,
    ).toBe(false);
    expect(
      buildPlayerSeriesQueryOptions('t', '', { dimension: 'overall', periodType: 'monthly' })
        .enabled,
    ).toBe(false);
    expect(
      buildCohortComparisonQueryOptions('t', {
        dimension: 'attendance',
        periodType: 'monthly',
        periodKey: '',
      }).enabled,
    ).toBe(false);
    expect(
      buildCohortComparisonQueryOptions('t', {
        dimension: 'attendance',
        periodType: 'monthly',
        periodKey: '2026-04',
      }).enabled,
    ).toBe(true);
  });

  it('wires each read behind its use case', () => {
    void buildTeamSeriesQueryOptions('t', {
      dimension: 'attendance',
      periodType: 'monthly',
    }).queryFn();
    expect(getTeamSeries).toHaveBeenCalledOnce();
    void buildPlayerSeriesQueryOptions('t', 'm', {
      dimension: 'overall',
      periodType: 'monthly',
    }).queryFn();
    expect(getPlayerSeries).toHaveBeenCalledOnce();
    void buildCohortComparisonQueryOptions('t', {
      dimension: 'attendance',
      periodType: 'monthly',
      periodKey: '2026-04',
    }).queryFn();
    expect(getCohortComparison).toHaveBeenCalledOnce();
  });
});
