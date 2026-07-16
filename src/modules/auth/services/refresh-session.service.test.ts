import { afterEach, describe, expect, it } from 'vitest';

import {
  configureAppHttpClient,
  createHttpClient,
  createTestAdapter,
  resetAppHttpClientForTesting,
  type TestRoute,
} from '@/packages/http';

import { buildTokenPair, createMemoryTokenStore } from '../../../../tests/factories/http.factory';
import { AUTH_API_PATHS } from '../constants/auth-api.constants';
import { createRefreshExecutor } from './refresh-session.service';

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

describe('createRefreshExecutor', () => {
  it('exchanges a refresh token for the rotated pair', async () => {
    wireClient([
      {
        method: 'POST',
        url: AUTH_API_PATHS.refresh,
        respond: () => ({
          status: 200,
          data: { tokens: { accessToken: 'access-2', refreshToken: 'refresh-2' } },
        }),
      },
    ]);

    await expect(createRefreshExecutor()('refresh-1')).resolves.toEqual({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    });
  });

  it('sends the caller-supplied refresh token in the request body', async () => {
    let seenBody: unknown;
    wireClient([
      {
        method: 'POST',
        url: AUTH_API_PATHS.refresh,
        respond: (config) => {
          seenBody = config.data;
          return {
            status: 200,
            data: { tokens: { accessToken: 'access-2', refreshToken: 'refresh-2' } },
          };
        },
      },
    ]);

    await createRefreshExecutor()('refresh-77');

    expect(seenBody).toEqual({ refreshToken: 'refresh-77' });
  });

  it('maps only the token pair, dropping any extra wire fields', async () => {
    wireClient([
      {
        method: 'POST',
        url: AUTH_API_PATHS.refresh,
        respond: () => ({
          status: 200,
          data: {
            tokens: { accessToken: 'access-2', refreshToken: 'refresh-2', scope: 'ignored' },
            issuedAt: '2026-07-16T10:15:00.000Z',
          },
        }),
      },
    ]);

    const pair = await createRefreshExecutor()('refresh-1');

    expect(Object.keys(pair)).toEqual(['accessToken', 'refreshToken']);
  });

  it('rejects when the refresh endpoint refuses the token', async () => {
    wireClient([
      {
        method: 'POST',
        url: AUTH_API_PATHS.refresh,
        respond: () => ({ status: 401, data: { statusCode: 401 } }),
      },
    ]);

    await expect(createRefreshExecutor()('garbage')).rejects.toThrow();
  });
});
