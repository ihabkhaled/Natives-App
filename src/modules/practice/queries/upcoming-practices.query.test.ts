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
    const options = buildUpcomingPracticesQueryOptions();

    expect(options.queryKey).toEqual(practiceQueryKeys.upcoming());
    expect(options.staleTime).toBeGreaterThan(0);
    expect(options.gcTime).toBeGreaterThan(options.staleTime);
  });

  it('runs the upcoming use case', async () => {
    vi.mocked(getUpcomingPractices).mockResolvedValue([]);

    await buildUpcomingPracticesQueryOptions().queryFn();

    expect(getUpcomingPractices).toHaveBeenCalledOnce();
  });
});
