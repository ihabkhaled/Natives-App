import { afterEach, describe, expect, it } from 'vitest';

import { resetAppHttpClientForTesting, type TestRoute } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { catchAppError } from '../../../../tests/setup/expect-app-error.helper';
import { AUTH_API_PATHS } from '../constants/auth-api.constants';
import { ACCOUNT_STATE } from '../types/auth.types';
import { submitSignup } from './signup.service';

const REQUEST = {
  displayName: 'Nadia Newcomer',
  email: 'nadia@example.com',
  password: 'Ranger#Strong1234',
} as const;

function route(status: number, data: unknown): TestRoute {
  return { method: 'POST', url: AUTH_API_PATHS.signup, respond: () => ({ status, data }) };
}

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('submitSignup', () => {
  it('reports the pending state the backend acknowledged', async () => {
    installTestAppHttpClient([
      route(201, { message: 'identity.signup.received', state: ACCOUNT_STATE.Pending }),
    ]);

    await expect(submitSignup(REQUEST)).resolves.toBe(ACCOUNT_STATE.Pending);
  });

  it('surfaces a duplicate email as a conflict the screen can word itself', async () => {
    installTestAppHttpClient([route(409, { statusCode: 409, code: 'EMAIL_ALREADY_REGISTERED' })]);

    const failure = await catchAppError(submitSignup(REQUEST));

    expect(failure.code).toBe(APP_ERROR_CODE.Conflict);
  });

  it('sanitizes a server failure into an AppError', async () => {
    installTestAppHttpClient([route(500, { statusCode: 500 })]);

    const failure = await catchAppError(submitSignup(REQUEST));

    expect(failure.code).toBe(APP_ERROR_CODE.Server);
  });

  it('wraps a non-transport failure as an unexpected AppError', async () => {
    const failure = await catchAppError(submitSignup(REQUEST));

    expect(failure.code).toBe(APP_ERROR_CODE.Unexpected);
  });
});
