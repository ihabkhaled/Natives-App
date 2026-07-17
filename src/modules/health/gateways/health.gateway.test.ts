import { afterEach, describe, expect, it } from 'vitest';

import { resetAppHttpClientForTesting } from '@/packages/http';

import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { HEALTH_API_PATHS } from '../constants/health-api.constants';
import { requestHealth } from './health.gateway';

const HEALTH_DTO = { status: 'ok', version: '1.4.2', timestamp: '2026-07-16T10:15:00.000Z' };

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('requestHealth', () => {
  it('gets the health endpoint and returns the parsed payload', async () => {
    installTestAppHttpClient([
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
    installTestAppHttpClient([
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
    installTestAppHttpClient([
      {
        method: 'GET',
        url: HEALTH_API_PATHS.health,
        respond: () => ({ status: 200, data: { ...HEALTH_DTO, status: 'degraded' } }),
      },
    ]);

    await expect(requestHealth()).rejects.toThrow();
  });
});
