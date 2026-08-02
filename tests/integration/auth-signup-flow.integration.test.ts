import { wireRealHttpClient } from '../setup/real-http-client.helper';
import { beforeEach, describe, expect, it } from 'vitest';

import { getAuthTokenRepository } from '@/modules/auth';
import { submitSignup } from '@/modules/auth/services/signup.service';
import { ACCOUNT_STATE } from '@/modules/auth/types/auth.types';
import type { SignupFormValues } from '@/modules/auth/types/signup.types';
import { resetAppHttpClientForTesting } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { MOCK_SIGNUP, MOCK_STRONG_PASSWORD } from '@/tests/msw/mock-data.constants';
import { resetMockAuthState } from '@/tests/msw/handlers';

import { catchAppError } from '../setup/expect-app-error.helper';

function request(overrides: Partial<SignupFormValues> = {}): SignupFormValues {
  return {
    displayName: MOCK_SIGNUP.displayName,
    email: MOCK_SIGNUP.email,
    password: MOCK_STRONG_PASSWORD,
    ...overrides,
  };
}

describe('self-signup flow (real client + MSW)', () => {
  beforeEach(async () => {
    resetAppHttpClientForTesting();
    resetMockAuthState();
    wireRealHttpClient();
    await getAuthTokenRepository().clearTokens();
  });

  it('accepts a new request and reports the account as pending approval', async () => {
    await expect(submitSignup(request())).resolves.toBe(ACCOUNT_STATE.Pending);
  });

  it('never starts a session: no tokens are stored on success', async () => {
    await submitSignup(request());

    await expect(getAuthTokenRepository().getAccessToken()).resolves.toBeNull();
    await expect(getAuthTokenRepository().getRefreshToken()).resolves.toBeNull();
  });

  it('rejects an email that already belongs to an account with a conflict', async () => {
    const failure = await catchAppError(submitSignup(request({ email: MOCK_SIGNUP.takenEmail })));

    expect(failure.code).toBe(APP_ERROR_CODE.Conflict);
  });

  it('rejects a second request for an email that is already awaiting approval', async () => {
    await expect(submitSignup(request())).resolves.toBe(ACCOUNT_STATE.Pending);

    const failure = await catchAppError(submitSignup(request()));

    expect(failure.code).toBe(APP_ERROR_CODE.Conflict);
  });

  it('rejects a password the shared policy would refuse', async () => {
    const failure = await catchAppError(submitSignup(request({ password: 'short' })));

    expect(failure.code).toBe(APP_ERROR_CODE.Validation);
  });

  it('leaks no raw backend text into the surfaced failure', async () => {
    const failure = await catchAppError(submitSignup(request({ email: MOCK_SIGNUP.takenEmail })));

    expect(failure.message).not.toContain('An account already exists');
  });
});
