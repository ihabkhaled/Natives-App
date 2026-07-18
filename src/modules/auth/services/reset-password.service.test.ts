import { afterEach, describe, expect, it, vi } from 'vitest';

import { trackEvent } from '@/packages/analytics';
import { resetAppHttpClientForTesting, type TestRoute } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import type { AppError } from '@/shared/errors/app.errors';

import { catchAppError } from '../../../../tests/setup/expect-app-error.helper';
import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { AUTH_ANALYTICS_EVENTS } from '../constants/auth-analytics.constants';
import { AUTH_API_PATHS } from '../constants/auth-api.constants';
import { resetPassword } from './reset-password.service';

vi.mock('@/packages/analytics', () => ({ trackEvent: vi.fn() }));

const VALUES = { password: 'Ranger#Strong1234', confirmPassword: 'Ranger#Strong1234' };

function resetRoute(status: number, data: unknown): TestRoute {
  return { method: 'POST', url: AUTH_API_PATHS.passwordReset, respond: () => ({ status, data }) };
}

async function resetFailure(status: number, data: unknown): Promise<AppError> {
  installTestAppHttpClient([resetRoute(status, data)]);
  return catchAppError(resetPassword('reset-token', VALUES));
}

afterEach(() => {
  resetAppHttpClientForTesting();
  vi.clearAllMocks();
});

describe('resetPassword', () => {
  it('resolves and tracks completion when the token is accepted', async () => {
    installTestAppHttpClient([resetRoute(200, { message: 'identity.password.reset.completed' })]);

    await expect(resetPassword('reset-token', VALUES)).resolves.toBeUndefined();
    expect(trackEvent).toHaveBeenCalledExactlyOnceWith(
      AUTH_ANALYTICS_EVENTS.passwordResetCompleted,
    );
  });

  it('maps a dead reset link (410) to the link-invalid code', async () => {
    const failure = await resetFailure(410, { statusCode: 410, code: 'RESET_LINK_INVALID' });

    expect(failure.code).toBe(APP_ERROR_CODE.LinkInvalidOrExpired);
  });

  it('maps a server-side policy rejection (422) through the transport mapper', async () => {
    const failure = await resetFailure(422, { statusCode: 422, code: 'VALIDATION_ERROR' });

    expect(failure.code).toBe(APP_ERROR_CODE.Validation);
  });

  it('wraps a non-transport failure as unexpected', async () => {
    const failure = await catchAppError(resetPassword('reset-token', VALUES));

    expect(failure.code).toBe(APP_ERROR_CODE.Unexpected);
  });
});
