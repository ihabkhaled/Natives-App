import { afterEach, describe, expect, it } from 'vitest';

import { resetAppHttpClientForTesting, type TestRoute } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import { catchAppError } from '../../../../tests/setup/expect-app-error.helper';
import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { AUTH_API_PATHS } from '../constants/auth-api.constants';
import { requestPasswordResetLink } from './request-password-reset.service';

function forgotRoute(status: number, data: unknown): TestRoute {
  return { method: 'POST', url: AUTH_API_PATHS.passwordForgot, respond: () => ({ status, data }) };
}

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('requestPasswordResetLink', () => {
  it('resolves on the enumeration-safe happy path', async () => {
    installTestAppHttpClient([forgotRoute(200, { success: true })]);

    await expect(requestPasswordResetLink('user@example.com')).resolves.toBeUndefined();
  });

  it('maps a server failure to a sanitized AppError', async () => {
    installTestAppHttpClient([forgotRoute(500, { statusCode: 500 })]);

    const failure = await catchAppError(requestPasswordResetLink('user@example.com'));

    expect(failure.code).toBe(APP_ERROR_CODE.Server);
  });

  it('wraps a non-transport failure as an unexpected AppError', async () => {
    const failure = await catchAppError(requestPasswordResetLink('user@example.com'));

    expect(failure.code).toBe(APP_ERROR_CODE.Unexpected);
  });
});
