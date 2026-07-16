import { afterEach, describe, expect, it, vi } from 'vitest';

import { getHealthStatus } from '../services/get-health.service';
import { healthQueryKeys } from './health.keys';
import { buildHealthQueryOptions } from './health.query';

vi.mock('../services/get-health.service', () => ({ getHealthStatus: vi.fn() }));

const STATUS = { isHealthy: true, version: '1.4.2', checkedAtIso: '2026-07-16T10:15:00.000Z' };

afterEach(() => {
  vi.clearAllMocks();
});

describe('buildHealthQueryOptions', () => {
  it('keys the query through the health key factory', () => {
    expect(buildHealthQueryOptions().queryKey).toEqual(healthQueryKeys.status());
  });

  it('delegates fetching to the health use case', async () => {
    vi.mocked(getHealthStatus).mockResolvedValue(STATUS);

    await expect(buildHealthQueryOptions().queryFn()).resolves.toBe(STATUS);
    expect(getHealthStatus).toHaveBeenCalledTimes(1);
  });

  it('does not fetch until the query function is invoked', () => {
    buildHealthQueryOptions();

    expect(getHealthStatus).not.toHaveBeenCalled();
  });

  it('propagates use-case failures to the caller', async () => {
    vi.mocked(getHealthStatus).mockRejectedValue(new Error('nope'));

    await expect(buildHealthQueryOptions().queryFn()).rejects.toThrow('nope');
  });
});
