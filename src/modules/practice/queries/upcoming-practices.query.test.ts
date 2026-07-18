import { afterEach, describe, expect, it, vi } from 'vitest';

import { getUpcomingPractices } from '../services/get-upcoming-practices.service';
import { practiceQueryKeys } from './practice.keys';
import { buildUpcomingPracticesQueryOptions } from './upcoming-practices.query';

vi.mock('../services/get-upcoming-practices.service', () => ({ getUpcomingPractices: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('buildUpcomingPracticesQueryOptions', () => {
  it('uses the upcoming key and caches for offline reads', () => {
    const options = buildUpcomingPracticesQueryOptions('team-1');

    expect(options.queryKey).toEqual(practiceQueryKeys.upcoming('team-1'));
    expect(options.staleTime).toBeGreaterThan(0);
    expect(options.gcTime).toBeGreaterThan(options.staleTime);
  });

  it('runs the upcoming use case', async () => {
    vi.mocked(getUpcomingPractices).mockResolvedValue([]);

    await buildUpcomingPracticesQueryOptions('team-1').queryFn();

    expect(getUpcomingPractices).toHaveBeenCalledWith('team-1');
  });

  it('waits for a membership team id', () => {
    expect(buildUpcomingPracticesQueryOptions('').enabled).toBe(false);
  });
});
