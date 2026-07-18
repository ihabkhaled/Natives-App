import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  configureAppHttpClient,
  createHttpClient,
  createTestAdapter,
  resetAppHttpClientForTesting,
  type TestRoute,
} from '@/packages/http';

import { buildTokenPair, createMemoryTokenStore } from '../../../../tests/factories/http.factory';
import { AUTH_API_PATHS } from '../constants/auth-api.constants';
import {
  requestCurrentUser,
  requestLogin,
  requestLogout,
  requestTokenRefresh,
} from './auth.gateway';

interface SeenRequest {
  readonly url: string;
  readonly data: unknown;
  readonly headers: Record<string, unknown>;
}

const USER_DTO = {
  id: 'user-1',
  email: 'ranger@example.com',
  displayName: 'Ranger One',
  permissions: ['members.read'],
  accountState: 'active',
  onboardingComplete: true,
  memberships: [
    { teamId: 'team-1', teamName: 'Team One', seasonId: 'season-1', seasonName: 'Season One' },
  ],
};
const TOKENS_DTO = { accessToken: 'access-2', refreshToken: 'refresh-2' };

let seen: SeenRequest[] = [];

function recordingRoute(method: string, url: string, data: unknown): TestRoute {
  return {
    method,
    url,
    respond: (config) => {
      seen.push({ url, data: config.data, headers: config.headers });
      return { status: 200, data };
    },
  };
}

function seenFor(url: string): SeenRequest {
  const request = seen.find((candidate) => candidate.url === url);
  expect(request).toBeDefined();
  return request!;
}

beforeEach(() => {
  seen = [];
  configureAppHttpClient(
    createHttpClient({
      config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 },
      tokenStore: createMemoryTokenStore(buildTokenPair()),
      adapter: createTestAdapter([
        recordingRoute('POST', AUTH_API_PATHS.login, { tokens: TOKENS_DTO, user: USER_DTO }),
        recordingRoute('POST', AUTH_API_PATHS.refresh, { tokens: TOKENS_DTO }),
        recordingRoute('POST', AUTH_API_PATHS.logout, { success: true }),
        recordingRoute('GET', AUTH_API_PATHS.currentUser, USER_DTO),
      ]),
    }),
  );
});

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('requestLogin', () => {
  it('posts the credentials to the login endpoint and returns the parsed envelope', async () => {
    const response = await requestLogin({ email: 'ranger@example.com', password: 'Sup3rSecret!' });

    expect(response).toEqual({ tokens: TOKENS_DTO, user: USER_DTO });
    expect(seenFor(AUTH_API_PATHS.login).data).toEqual({
      email: 'ranger@example.com',
      password: 'Sup3rSecret!',
    });
  });

  it('never attaches a bearer token to the login request', async () => {
    await requestLogin({ email: 'ranger@example.com', password: 'Sup3rSecret!' });

    expect(seenFor(AUTH_API_PATHS.login).headers['Authorization']).toBeUndefined();
  });

  it('carries a correlation id like every other request', async () => {
    await requestLogin({ email: 'ranger@example.com', password: 'Sup3rSecret!' });

    expect(String(seenFor(AUTH_API_PATHS.login).headers['X-Request-Id'])).not.toBe('');
  });
});

describe('requestTokenRefresh', () => {
  it('posts the refresh token and returns the rotated pair', async () => {
    const response = await requestTokenRefresh('refresh-1');

    expect(response).toEqual({ tokens: TOKENS_DTO });
    expect(seenFor(AUTH_API_PATHS.refresh).data).toEqual({ refreshToken: 'refresh-1' });
  });

  it('never attaches a bearer token to the refresh request', async () => {
    await requestTokenRefresh('refresh-1');

    expect(seenFor(AUTH_API_PATHS.refresh).headers['Authorization']).toBeUndefined();
  });
});

describe('requestLogout', () => {
  it('posts an empty body to the logout endpoint with the bearer token', async () => {
    const response = await requestLogout();

    expect(response).toEqual({ success: true });
    expect(seenFor(AUTH_API_PATHS.logout).data).toEqual({});
    expect(seenFor(AUTH_API_PATHS.logout).headers['Authorization']).toBe('Bearer access-1');
  });
});

describe('requestCurrentUser', () => {
  it('gets the profile with the bearer token and returns the parsed user', async () => {
    const response = await requestCurrentUser();

    expect(response).toEqual(USER_DTO);
    expect(seenFor(AUTH_API_PATHS.currentUser).headers['Authorization']).toBe('Bearer access-1');
  });

  it('rejects a profile payload that violates the wire contract', async () => {
    resetAppHttpClientForTesting();
    configureAppHttpClient(
      createHttpClient({
        config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 },
        tokenStore: createMemoryTokenStore(buildTokenPair()),
        adapter: createTestAdapter([
          recordingRoute('GET', AUTH_API_PATHS.currentUser, { ...USER_DTO, email: 'nope' }),
        ]),
      }),
    );

    await expect(requestCurrentUser()).rejects.toThrow();
  });
});
