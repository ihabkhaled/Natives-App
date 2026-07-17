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
import { AUTH_API_PATHS } from '../constants/auth-api.constants';
import { getCurrentUser } from './get-current-user.service';

function wireClient(routes: readonly TestRoute[]): void {
  configureAppHttpClient(
    createHttpClient({
      config: { baseUrl: 'http://api.test/api/v1', timeoutMs: 1000 },
      tokenStore: createMemoryTokenStore(buildTokenPair()),
      adapter: createTestAdapter(routes),
    }),
  );
}

function currentUserRoute(status: number, data: unknown): TestRoute {
  return { method: 'GET', url: AUTH_API_PATHS.currentUser, respond: () => ({ status, data }) };
}

async function currentUserFailure(): Promise<AppError> {
  const outcome: unknown = await getCurrentUser().catch((error: unknown) => error);
  expect(outcome).toBeInstanceOf(AppError);
  return outcome as AppError;
}

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('getCurrentUser', () => {
  it('returns the normalized profile on success', async () => {
    wireClient([
      currentUserRoute(200, {
        id: 'user-1',
        email: 'Ranger@Example.com',
        displayName: ' Ranger One ',
      }),
    ]);

    await expect(getCurrentUser()).resolves.toEqual({
      id: 'user-1',
      email: 'ranger@example.com',
      displayName: 'Ranger One',
    });
  });

  it('maps a 401 to the unauthorized code', async () => {
    wireClient([currentUserRoute(401, { statusCode: 401 })]);

    const failure = await currentUserFailure();

    expect(failure).toBeInstanceOf(AppError);
    expect(failure.code).toBe(APP_ERROR_CODE.Unauthorized);
  });

  it('maps a 500 to the server code', async () => {
    wireClient([currentUserRoute(500, { statusCode: 500 })]);

    expect((await currentUserFailure()).code).toBe(APP_ERROR_CODE.Server);
  });

  it('maps a contract violation to an unexpected AppError', async () => {
    wireClient([currentUserRoute(200, { id: 'user-1', email: 'not-an-email', displayName: 'X' })]);

    const failure = await currentUserFailure();

    expect(failure).toBeInstanceOf(AppError);
    expect(failure.code).toBe(APP_ERROR_CODE.Unexpected);
  });

  it('wraps a non-HTTP failure into an unexpected AppError', async () => {
    const failure = await currentUserFailure();

    expect(failure).toBeInstanceOf(AppError);
    expect(failure.code).toBe(APP_ERROR_CODE.Unexpected);
  });
});
