import { afterEach, describe, expect, it } from 'vitest';

import {
  configureAppHttpClient,
  createHttpClient,
  createTestAdapter,
  resetAppHttpClientForTesting,
  type TestRoute,
} from '@/packages/http';

import { buildTokenPair, createMemoryTokenStore } from '../../../../tests/factories/http.factory';
import { HEALTH_API_PATHS } from '../constants/health-api.constants';
import { requestHealth } from './health.gateway';

const HEALTH_DTO = { status: 'ok', version: '1.4.2', timestamp: '2026-07-16T10:15:00.000Z' };

function wireClient(routes: readonly TestRoute[]): void {
  configureAppHttpClient(
    createHttpClient({
      config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 },
      tokenStore: createMemoryTokenStore(buildTokenPair()),
      adapter: createTestAdapter(routes),
    }),
  );
}

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('requestHealth', () => {
  it('gets the health endpoint and returns the parsed payload', async () => {
    wireClient([
      {
        method: 'GET',
        url: HEALTH_API_PATHS.health,
        respond: () => ({ status: 200, data: HEALTH_DTO }),
      },
    ]);

    await expect(requestHealth()).resolves.toEqual(HEALTH_DTO);
  });

  it('never attaches a bearer token: health is a public probe', async () => {
    let seenHeaders: Record<string, unknown> = {};
    wireClient([
      {
        method: 'GET',
        url: HEALTH_API_PATHS.health,
        respond: (config) => {
          seenHeaders = config.headers;
          return { status: 200, data: HEALTH_DTO };
        },
      },
    ]);

    await requestHealth();

    expect(seenHeaders['Authorization']).toBeUndefined();
    expect(String(seenHeaders['X-Request-Id'])).not.toBe('');
  });

  it('rejects a payload that violates the wire contract', async () => {
    wireClient([
      {
        method: 'GET',
        url: HEALTH_API_PATHS.health,
        respond: () => ({ status: 200, data: { ...HEALTH_DTO, status: 'degraded' } }),
      },
    ]);

    await expect(requestHealth()).rejects.toThrow();
  });
});
