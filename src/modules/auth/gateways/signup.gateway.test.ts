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
import { requestSignup } from './signup.gateway';

const VALUES = {
  displayName: 'Nadia Newcomer',
  email: 'nadia@example.com',
  password: 'Ranger#Strong1234',
} as const;

interface Capture {
  data: unknown;
  headers: Record<string, unknown>;
}

let captured: Capture | null = null;

function signupRoute(status: number, data: unknown): TestRoute {
  return {
    method: 'POST',
    url: AUTH_API_PATHS.signup,
    respond: (config) => {
      captured = { data: config.data, headers: config.headers };
      return { status, data };
    },
  };
}

function install(route: TestRoute): void {
  configureAppHttpClient(
    createHttpClient({
      config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 },
      tokenStore: createMemoryTokenStore(buildTokenPair()),
      adapter: createTestAdapter([route]),
    }),
  );
}

beforeEach(() => {
  captured = null;
});

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('requestSignup', () => {
  it('posts exactly the three contract fields and parses the acknowledgement', async () => {
    install(signupRoute(201, { message: 'identity.signup.received', state: 'pending' }));

    const response = await requestSignup(VALUES);

    expect(response).toEqual({ message: 'identity.signup.received', state: 'pending' });
    expect(captured?.data).toEqual({
      email: VALUES.email,
      displayName: VALUES.displayName,
      password: VALUES.password,
    });
  });

  it('sends no Authorization header: signup is an anonymous endpoint', async () => {
    install(signupRoute(201, { message: 'identity.signup.received', state: 'pending' }));

    await requestSignup(VALUES);

    expect(captured?.headers['Authorization']).toBeUndefined();
  });

  it('rejects an acknowledgement that violates the response contract', async () => {
    install(signupRoute(201, { message: 'identity.signup.received', state: 'approved' }));

    await expect(requestSignup(VALUES)).rejects.toBeDefined();
  });
});
