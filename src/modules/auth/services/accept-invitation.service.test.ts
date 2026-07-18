import { afterEach, describe, expect, it, vi } from 'vitest';

import { trackEvent } from '@/packages/analytics';
import { resetAppHttpClientForTesting, type TestRoute } from '@/packages/http';
import { getSecureValue } from '@/packages/secure-storage';
import { STORAGE_KEYS } from '@/shared/config';
import { APP_ERROR_CODE } from '@/shared/errors';

import { catchAppError } from '../../../../tests/setup/expect-app-error.helper';
import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { AUTH_ANALYTICS_EVENTS } from '../constants/auth-analytics.constants';
import { invitationAcceptPath } from '../constants/auth-api.constants';
import { acceptInvitation } from './accept-invitation.service';

vi.mock('@/packages/analytics', () => ({ trackEvent: vi.fn() }));

vi.mock('@/packages/secure-storage', async () => {
  const { createSecureStorageDouble } =
    await import('../../../../tests/setup/secure-storage-double.helper');
  return createSecureStorageDouble();
});

const TOKEN = 'invite-1';
const SESSION_PAYLOAD = {
  tokens: { accessToken: 'invited-access', refreshToken: 'invited-refresh' },
  user: {
    id: 'user-invited',
    email: 'invitee@example.com',
    displayName: 'Invited Ranger',
    permissions: ['members.read'],
    accountState: 'active',
    onboardingComplete: true,
    memberships: [],
  },
};

function acceptRoute(status: number, data: unknown): TestRoute {
  return { method: 'POST', url: invitationAcceptPath(TOKEN), respond: () => ({ status, data }) };
}

afterEach(() => {
  resetAppHttpClientForTesting();
  vi.clearAllMocks();
});

describe('acceptInvitation', () => {
  it('returns the session, persists tokens, and tracks acceptance', async () => {
    installTestAppHttpClient([acceptRoute(200, SESSION_PAYLOAD)]);

    const session = await acceptInvitation(TOKEN, 'Ranger#Strong1234');

    expect(session.user.email).toBe('invitee@example.com');
    await expect(getSecureValue(STORAGE_KEYS.authAccessToken)).resolves.toBe('invited-access');
    expect(trackEvent).toHaveBeenCalledExactlyOnceWith(AUTH_ANALYTICS_EVENTS.invitationAccepted);
  });

  it('maps an already-used invitation (409) to the link-invalid code', async () => {
    installTestAppHttpClient([acceptRoute(409, { statusCode: 409, code: 'INVITATION_USED' })]);

    const failure = await catchAppError(acceptInvitation(TOKEN, 'Ranger#Strong1234'));

    expect(failure.code).toBe(APP_ERROR_CODE.LinkInvalidOrExpired);
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('wraps a non-transport failure as unexpected', async () => {
    const failure = await catchAppError(acceptInvitation(TOKEN, 'Ranger#Strong1234'));

    expect(failure.code).toBe(APP_ERROR_CODE.Unexpected);
  });
});
