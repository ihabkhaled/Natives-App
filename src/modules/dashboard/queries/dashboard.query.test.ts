import { afterEach, describe, expect, it, vi } from 'vitest';

import { getDashboardSummary } from '../services/get-dashboard-summary.service';
import { dashboardQueryKeys } from './dashboard.keys';
import { buildDashboardSummaryQueryOptions } from './dashboard.query';

vi.mock('../services/get-dashboard-summary.service', () => ({ getDashboardSummary: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('buildDashboardSummaryQueryOptions', () => {
  it('keys the query through the dashboard key factory', () => {
    expect(buildDashboardSummaryQueryOptions().queryKey).toEqual(dashboardQueryKeys.summary());
  });

  it('delegates fetching to the summary use case', async () => {
    const resolved = {
      persona: 'coach',
      generatedAtIso: '2026-07-01T06:30:00.000Z',
      widgets: [],
    } as const;
    vi.mocked(getDashboardSummary).mockResolvedValue(resolved);

    await expect(buildDashboardSummaryQueryOptions().queryFn()).resolves.toBe(resolved);
    expect(getDashboardSummary).toHaveBeenCalledTimes(1);
  });

  it('does not fetch until the query function is invoked', () => {
    buildDashboardSummaryQueryOptions();

    expect(getDashboardSummary).not.toHaveBeenCalled();
  });

  it('propagates use-case failures to the caller', async () => {
    vi.mocked(getDashboardSummary).mockRejectedValue(new Error('nope'));

    await expect(buildDashboardSummaryQueryOptions().queryFn()).rejects.toThrow('nope');
  });
});
