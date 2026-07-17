import { afterEach, describe, expect, it, vi } from 'vitest';

import { trackEvent } from '@/packages/analytics';
import { resetAppHttpClientForTesting, type TestRoute } from '@/packages/http';
import { getSecureValue } from '@/packages/secure-storage';
import { STORAGE_KEYS } from '@/shared/config';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { AUTH_ANALYTICS_EVENTS } from '../constants/auth-analytics.constants';
import { AUTH_API_PATHS } from '../constants/auth-api.constants';
import { loginUser } from './login.service';

vi.mock('@/packages/analytics', () => ({ trackEvent: vi.fn() }));

vi.mock('@/packages/secure-storage', async () => {
  const { createSecureStorageDouble } =
    await import('../../../../tests/setup/secure-storage-double.helper');
  return createSecureStorageDouble();
});

const CREDENTIALS = { email: 'ranger@example.com', password: 'Sup3rSecret!' };

function loginRoute(status: number, data: unknown): TestRoute {
  return { method: 'POST', url: AUTH_API_PATHS.login, respond: () => ({ status, data }) };
}

async function loginFailure(): Promise<AppError> {
  const outcome: unknown = await loginUser(CREDENTIALS).catch((error: unknown) => error);
  expect(outcome).toBeInstanceOf(AppError);
  return outcome as AppError;
}

afterEach(() => {
  resetAppHttpClientForTesting();
  vi.clearAllMocks();
});

describe('loginUser', () => {
  it('returns the mapped session on success', async () => {
    installTestAppHttpClient([
      loginRoute(200, {
        tokens: { accessToken: 'access-9', refreshToken: 'refresh-9' },
        user: { id: 'user-1', email: 'Ranger@Example.com', displayName: ' Ranger One ' },
      }),
    ]);

    const session = await loginUser(CREDENTIALS);

    expect(session).toEqual({
      user: { id: 'user-1', email: 'ranger@example.com', displayName: 'Ranger One' },
      tokens: { accessToken: 'access-9', refreshToken: 'refresh-9' },
    });
  });

  it('persists the issued pair in secure storage', async () => {
    installTestAppHttpClient([
      loginRoute(200, {
        tokens: { accessToken: 'access-9', refreshToken: 'refresh-9' },
        user: { id: 'user-1', email: 'ranger@example.com', displayName: 'Ranger One' },
      }),
    ]);

    await loginUser(CREDENTIALS);

    await expect(getSecureValue(STORAGE_KEYS.authAccessToken)).resolves.toBe('access-9');
    await expect(getSecureValue(STORAGE_KEYS.authRefreshToken)).resolves.toBe('refresh-9');
  });

  it('tracks the login-succeeded event once', async () => {
    installTestAppHttpClient([
      loginRoute(200, {
        tokens: { accessToken: 'access-9', refreshToken: 'refresh-9' },
        user: { id: 'user-1', email: 'ranger@example.com', displayName: 'Ranger One' },
      }),
    ]);

    await loginUser(CREDENTIALS);

    expect(trackEvent).toHaveBeenCalledExactlyOnceWith(AUTH_ANALYTICS_EVENTS.loginSucceeded);
  });

  it('maps a 401 to the invalid-credentials code', async () => {
    installTestAppHttpClient([loginRoute(401, { statusCode: 401, code: 'INVALID_CREDENTIALS' })]);

    const failure = await loginFailure();

    expect(failure).toBeInstanceOf(AppError);
    expect(failure.code).toBe(APP_ERROR_CODE.InvalidCredentials);
  });

  it('never tracks a login event when authentication fails', async () => {
    installTestAppHttpClient([loginRoute(401, { statusCode: 401 })]);

    await loginFailure();

    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('maps a 500 through the shared HTTP error mapper', async () => {
    installTestAppHttpClient([loginRoute(500, { statusCode: 500 })]);

    const failure = await loginFailure();

    expect(failure).toBeInstanceOf(AppError);
    expect(failure.code).toBe(APP_ERROR_CODE.Server);
  });

  it('preserves the request id and field errors from a validation envelope', async () => {
    installTestAppHttpClient([
      loginRoute(400, {
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [{ field: 'email', code: 'INVALID_EMAIL', message: 'bad' }],
        requestId: 'req-9',
      }),
    ]);

    const failure = await loginFailure();

    expect(failure.code).toBe(APP_ERROR_CODE.Validation);
    expect(failure.requestId).toBe('req-9');
    expect(failure.fieldErrors).toEqual([{ field: 'email', code: 'INVALID_EMAIL' }]);
  });

  it('wraps a non-HTTP failure into an unexpected AppError', async () => {
    const failure = await loginFailure();

    expect(failure).toBeInstanceOf(AppError);
    expect(failure.code).toBe(APP_ERROR_CODE.Unexpected);
  });
});
