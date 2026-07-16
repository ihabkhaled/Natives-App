import { afterEach, describe, expect, it } from 'vitest';

import {
  configureAppHttpClient,
  createHttpClient,
  createTestAdapter,
  resetAppHttpClientForTesting,
  type TestRoute,
} from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { buildTokenPair, createMemoryTokenStore } from '../../../../tests/factories/http.factory';
import { HEALTH_API_PATHS } from '../constants/health-api.constants';
import { getHealthStatus } from './get-health.service';

function wireClient(routes: readonly TestRoute[]): void {
  configureAppHttpClient(
    createHttpClient({
      config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 },
      tokenStore: createMemoryTokenStore(buildTokenPair()),
      adapter: createTestAdapter(routes),
    }),
  );
}

function healthRoute(status: number, data: unknown): TestRoute {
  return { method: 'GET', url: HEALTH_API_PATHS.health, respond: () => ({ status, data }) };
}

async function healthFailure(): Promise<AppError> {
  const outcome: unknown = await getHealthStatus().catch((error: unknown) => error);
  expect(outcome).toBeInstanceOf(AppError);
  return outcome as AppError;
}

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('getHealthStatus', () => {
  it('maps a healthy response to the domain snapshot', async () => {
    wireClient([
      healthRoute(200, { status: 'ok', version: '1.4.2', timestamp: '2026-07-16T10:15:00.000Z' }),
    ]);

    await expect(getHealthStatus()).resolves.toEqual({
      isHealthy: true,
      version: '1.4.2',
      checkedAtIso: '2026-07-16T10:15:00.000Z',
    });
  });

  it('maps a reported error status to an unhealthy snapshot rather than a failure', async () => {
    wireClient([
      healthRoute(200, {
        status: 'error',
        version: '1.4.2',
        timestamp: '2026-07-16T10:15:00.000Z',
      }),
    ]);

    const status = await getHealthStatus();

    expect(status.isHealthy).toBe(false);
  });

  it('maps a 500 to the server code', async () => {
    wireClient([healthRoute(500, { statusCode: 500 })]);

    const failure = await healthFailure();

    expect(failure).toBeInstanceOf(AppError);
    expect(failure.code).toBe(APP_ERROR_CODE.Server);
  });

  it('maps a missing endpoint to the not-found code', async () => {
    wireClient([]);

    const failure = await healthFailure();

    expect(failure).toBeInstanceOf(AppError);
    expect(failure.code).toBe(APP_ERROR_CODE.NotFound);
  });

  it('maps a contract violation to an unexpected AppError', async () => {
    wireClient([healthRoute(200, { status: 'degraded', version: '1.4.2', timestamp: 'nope' })]);

    expect((await healthFailure()).code).toBe(APP_ERROR_CODE.Unexpected);
  });

  it('wraps a non-HTTP failure into an unexpected AppError', async () => {
    const failure = await healthFailure();

    expect(failure).toBeInstanceOf(AppError);
    expect(failure.code).toBe(APP_ERROR_CODE.Unexpected);
  });
});
