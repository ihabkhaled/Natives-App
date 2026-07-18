import { beforeEach, describe, expect, it } from 'vitest';

import { createRefreshExecutor, getAuthTokenRepository, handleAuthFailure } from '@/modules/auth';
import { acceptInvitation } from '@/modules/auth/services/accept-invitation.service';
import { getInvitation } from '@/modules/auth/services/get-invitation.service';
import { listSessions } from '@/modules/auth/services/list-sessions.service';
import { requestPasswordResetLink } from '@/modules/auth/services/request-password-reset.service';
import { resetPassword } from '@/modules/auth/services/reset-password.service';
import { revokeOtherSessions } from '@/modules/auth/services/revoke-other-sessions.service';
import { revokeSession } from '@/modules/auth/services/revoke-session.service';
import { getEnvironment } from '@/packages/environment';
import {
  configureAppHttpClient,
  createHttpClient,
  resetAppHttpClientForTesting,
} from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import {
  MOCK_INVITATION,
  MOCK_RESET,
  MOCK_STRONG_PASSWORD,
  MOCK_TOKENS,
} from '@/tests/msw/mock-data.constants';

import { catchAppError } from '../setup/expect-app-error.helper';

function wireRealHttpClient(): void {
  const environment = getEnvironment();
  configureAppHttpClient(
    createHttpClient({
      config: { baseUrl: environment.apiBaseUrl, timeoutMs: 2000 },
      tokenStore: getAuthTokenRepository(),
      refreshExecutor: createRefreshExecutor(),
      onAuthFailure: handleAuthFailure,
    }),
  );
}

const STRONG_VALUES = { password: MOCK_STRONG_PASSWORD, confirmPassword: MOCK_STRONG_PASSWORD };

describe('auth recovery flows (real client + MSW)', () => {
  beforeEach(async () => {
    resetAppHttpClientForTesting();
    wireRealHttpClient();
    await getAuthTokenRepository().clearTokens();
  });

  it('requests a reset link without leaking whether the account exists', async () => {
    await expect(requestPasswordResetLink('anyone@example.com')).resolves.toBeUndefined();
  });

  it('resets the password with a valid token and rejects an expired one', async () => {
    await expect(resetPassword(MOCK_RESET.validToken, STRONG_VALUES)).resolves.toBeUndefined();

    const failure = await catchAppError(resetPassword(MOCK_RESET.expiredToken, STRONG_VALUES));
    expect(failure.code).toBe(APP_ERROR_CODE.LinkInvalidOrExpired);
  });

  it('loads a valid invitation and rejects expired or used ones', async () => {
    const invitation = await getInvitation(MOCK_INVITATION.validToken);
    expect(invitation.email).toBe(MOCK_INVITATION.email);
    expect(invitation.role).toBe(MOCK_INVITATION.role);
    expect(invitation.inviterName).toBeNull();

    const expired = await catchAppError(getInvitation(MOCK_INVITATION.expiredToken));
    expect(expired.code).toBe(APP_ERROR_CODE.LinkInvalidOrExpired);

    const used = await catchAppError(getInvitation(MOCK_INVITATION.usedToken));
    expect(used.code).toBe(APP_ERROR_CODE.LinkInvalidOrExpired);
  });

  it('accepts an invitation, starting a session and storing tokens securely', async () => {
    const session = await acceptInvitation(MOCK_INVITATION.validToken, MOCK_STRONG_PASSWORD);

    expect(session.user.email).toBe(MOCK_INVITATION.email);
    await expect(getAuthTokenRepository().getAccessToken()).resolves.toBe(
      MOCK_TOKENS.invitedAccess,
    );
  });

  it('lists sessions in a deterministic order and revokes them', async () => {
    await getAuthTokenRepository().setTokens({
      accessToken: MOCK_TOKENS.access,
      refreshToken: MOCK_TOKENS.refresh,
    });

    const initial = await listSessions();
    expect(initial[0]?.isCurrent).toBe(true);
    expect(initial.length).toBeGreaterThan(1);

    const target = initial.find((session) => !session.isCurrent);
    await revokeSession(target!.id);

    const afterRevoke = await listSessions();
    expect(afterRevoke.some((session) => session.id === target!.id)).toBe(false);

    const revokedCount = await revokeOtherSessions();
    expect(revokedCount).toBeGreaterThanOrEqual(0);
    const remaining = await listSessions();
    expect(remaining.every((session) => session.isCurrent)).toBe(true);
  });

  it('rejects a session request without a bearer token', async () => {
    const failure = await catchAppError(listSessions());
    expect(failure.code).toBe(APP_ERROR_CODE.Unauthorized);
  });
});
