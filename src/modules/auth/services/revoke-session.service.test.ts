import { afterEach, describe, expect, it, vi } from 'vitest';

import { trackEvent } from '@/packages/analytics';
import { resetAppHttpClientForTesting, type TestRoute } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';

import { catchAppError } from '../../../../tests/setup/expect-app-error.helper';
import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { AUTH_ANALYTICS_EVENTS } from '../constants/auth-analytics.constants';
import { sessionRevokePath } from '../constants/auth-api.constants';
import { revokeSession } from './revoke-session.service';

vi.mock('@/packages/analytics', () => ({ trackEvent: vi.fn() }));

const SESSION_ID = 'session-tablet';

function revokeRoute(status: number, data: unknown): TestRoute {
  return { method: 'POST', url: sessionRevokePath(SESSION_ID), respond: () => ({ status, data }) };
}

afterEach(() => {
  resetAppHttpClientForTesting();
  vi.clearAllMocks();
});

describe('revokeSession', () => {
  it('resolves and records the revocation on success', async () => {
    installTestAppHttpClient([revokeRoute(200, { success: true })]);

    await expect(revokeSession(SESSION_ID)).resolves.toBeUndefined();
    expect(trackEvent).toHaveBeenCalledExactlyOnceWith(AUTH_ANALYTICS_EVENTS.sessionRevoked);
  });

  it('maps a missing session (404) through the transport mapper', async () => {
    installTestAppHttpClient([revokeRoute(404, { statusCode: 404 })]);

    const failure = await catchAppError(revokeSession(SESSION_ID));

    expect(failure.code).toBe(APP_ERROR_CODE.NotFound);
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('wraps a non-transport failure as unexpected', async () => {
    const failure = await catchAppError(revokeSession(SESSION_ID));

    expect(failure.code).toBe(APP_ERROR_CODE.Unexpected);
  });
});
