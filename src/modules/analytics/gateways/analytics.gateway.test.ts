import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import {
  requestCohortComparison,
  requestPlayerSeries,
  requestRebuildAnalytics,
  requestTeamSeries,
} from './analytics.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const get = vi.fn();
const post = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  get.mockResolvedValue({});
  post.mockResolvedValue({});
  vi.mocked(getAppHttpClient).mockReturnValue({ get, post } as never);
});

describe('analytics.gateway', () => {
  it('reads the player and team series from their paths', async () => {
    await requestPlayerSeries('t1', 'm1', { dimension: 'overall', periodType: 'monthly' });
    expect(get.mock.calls[0]?.[0]).toBe('/teams/t1/analytics/players/m1/series');

    await requestTeamSeries('t1', { dimension: 'attendance', periodType: 'monthly' });
    expect(get.mock.calls[1]?.[0]).toBe('/teams/t1/analytics/team/series');
  });

  it('reads the cohort comparison with its period key', async () => {
    await requestCohortComparison('t1', {
      dimension: 'attendance',
      periodType: 'monthly',
      periodKey: '2026-04',
    });
    const [path, , options] = get.mock.calls[0] as [
      string,
      unknown,
      { params: Record<string, unknown> },
    ];
    expect(path).toBe('/teams/t1/analytics/cohorts/comparison');
    expect(options.params).toMatchObject({ periodKey: '2026-04' });
  });

  it('posts a rebuild to its path', async () => {
    await requestRebuildAnalytics('t1', { periodType: 'monthly', seasonId: null });
    expect(post.mock.calls[0]?.[0]).toBe('/teams/t1/analytics/rebuild');
  });
});
