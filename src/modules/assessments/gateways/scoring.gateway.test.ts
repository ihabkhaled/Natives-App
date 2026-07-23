import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAppHttpClient } from '@/packages/http';

import { requestMyMeasurements } from './measurements.gateway';
import { requestMyPerformanceScore } from './scoring.gateway';

vi.mock('@/packages/http', () => ({ getAppHttpClient: vi.fn() }));

const get = vi.fn();

beforeEach(() => {
  get.mockReset().mockResolvedValue({});
  vi.mocked(getAppHttpClient).mockReturnValue({ get } as never);
});

describe('analytics self-read gateways', () => {
  it('reads the token-scoped own score list', async () => {
    await requestMyPerformanceScore('team-1');

    expect(get.mock.calls[0]?.[0]).toBe('/teams/team-1/my-performance-score');
  });

  it('reads the token-scoped own measurement history', async () => {
    await requestMyMeasurements('team-1');

    expect(get.mock.calls[0]?.[0]).toBe('/teams/team-1/my-measurements');
  });
});
