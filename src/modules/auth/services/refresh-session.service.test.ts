import { afterEach, describe, expect, it } from 'vitest';

import { resetAppHttpClientForTesting } from '@/packages/http';

import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { AUTH_API_PATHS } from '../constants/auth-api.constants';
import { createRefreshExecutor } from './refresh-session.service';

const REFRESH_RESPONSE = {
  accessToken: 'access-2',
  refreshToken: 'refresh-2',
  refreshTokenExpiresAt: '2026-08-18T12:00:00.000Z',
  userId: 'user-1',
};

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('createRefreshExecutor', () => {
  it('exchanges a refresh token for the rotated pair', async () => {
    installTestAppHttpClient([
      {
        method: 'POST',
        url: AUTH_API_PATHS.refresh,
        respond: () => ({
          status: 200,
          data: REFRESH_RESPONSE,
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
    installTestAppHttpClient([
      {
        method: 'POST',
        url: AUTH_API_PATHS.refresh,
        respond: (config) => {
          seenBody = config.data;
          return {
            status: 200,
            data: REFRESH_RESPONSE,
          };
        },
      },
    ]);

    await createRefreshExecutor()('refresh-77');

    expect(seenBody).toEqual({ refreshToken: 'refresh-77' });
  });

  it('maps only the token pair, dropping any extra wire fields', async () => {
    installTestAppHttpClient([
      {
        method: 'POST',
        url: AUTH_API_PATHS.refresh,
        respond: () => ({
          status: 200,
          data: {
            ...REFRESH_RESPONSE,
            issuedAt: '2026-07-16T10:15:00.000Z',
          },
        }),
      },
    ]);

    const pair = await createRefreshExecutor()('refresh-1');

    expect(Object.keys(pair)).toEqual(['accessToken', 'refreshToken']);
  });

  it('rejects when the refresh endpoint refuses the token', async () => {
    installTestAppHttpClient([
      {
        method: 'POST',
        url: AUTH_API_PATHS.refresh,
        respond: () => ({ status: 401, data: { statusCode: 401 } }),
      },
    ]);

    await expect(createRefreshExecutor()('garbage')).rejects.toThrow();
  });
});
