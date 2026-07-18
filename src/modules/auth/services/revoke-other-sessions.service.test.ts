import { afterEach, describe, expect, it } from 'vitest';

import { resetAppHttpClientForTesting, type TestRoute } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import { catchAppError } from '../../../../tests/setup/expect-app-error.helper';
import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { AUTH_API_PATHS } from '../constants/auth-api.constants';
import { revokeOtherSessions } from './revoke-other-sessions.service';

function revokeOthersRoute(status: number, data: unknown): TestRoute {
  return {
    method: 'POST',
    url: AUTH_API_PATHS.sessionsRevokeOthers,
    respond: () => ({ status, data }),
  };
}

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('revokeOtherSessions', () => {
  it('returns the revoked count reported by the backend', async () => {
    installTestAppHttpClient([revokeOthersRoute(200, { revokedCount: 3 })]);

    await expect(revokeOtherSessions()).resolves.toBe(3);
  });

  it('maps a server failure through the transport mapper', async () => {
    installTestAppHttpClient([revokeOthersRoute(500, { statusCode: 500 })]);

    const failure = await catchAppError(revokeOtherSessions());

    expect(failure.code).toBe(APP_ERROR_CODE.Server);
  });

  it('wraps a non-transport failure as unexpected', async () => {
    const failure = await catchAppError(revokeOtherSessions());

    expect(failure.code).toBe(APP_ERROR_CODE.Unexpected);
  });
});
