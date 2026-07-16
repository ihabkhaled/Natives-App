import { beforeEach, describe, expect, it } from 'vitest';

import {
  bootstrapSessionFromStoredTokens,
  createRefreshExecutor,
  getAuthTokenRepository,
  handleAuthFailure,
  SESSION_STATUS,
} from '@/modules/auth';
import { loginUser } from '@/modules/auth/services/login.service';
import { logoutUser } from '@/modules/auth/services/logout.service';
import { getCurrentUser } from '@/modules/auth/services/get-current-user.service';
import { useSessionStore } from '@/modules/auth/store/session.store';
import { getEnvironment } from '@/packages/environment';
import {
  configureAppHttpClient,
  createHttpClient,
  resetAppHttpClientForTesting,
} from '@/packages/http';
import { APP_ERROR_CODE, type AppError } from '@/shared/errors';
import { MOCK_CREDENTIALS, MOCK_SCENARIO_EMAILS } from '@/tests/msw/mock-data.constants';
import { http, HttpResponse } from 'msw';

import { mockApiServer } from '../setup/msw-server.setup';

function wireRealHttpClient(timeoutMs = 2000): void {
  const environment = getEnvironment();
  configureAppHttpClient(
    createHttpClient({
      config: { baseUrl: environment.apiBaseUrl, timeoutMs },
      tokenStore: getAuthTokenRepository(),
      refreshExecutor: createRefreshExecutor(),
      onAuthFailure: handleAuthFailure,
    }),
  );
}

describe('auth login flow (real client + MSW)', () => {
  beforeEach(async () => {
    resetAppHttpClientForTesting();
    wireRealHttpClient();
    await getAuthTokenRepository().clearTokens();
    useSessionStore.setState({ status: SESSION_STATUS.Unknown });
  });

  it('logs in, stores tokens securely, and loads the current user', async () => {
    const session = await loginUser({
      email: MOCK_CREDENTIALS.email,
      password: MOCK_CREDENTIALS.password,
    });

    expect(session.user.email).toBe(MOCK_CREDENTIALS.email);
    await expect(getAuthTokenRepository().getAccessToken()).resolves.toBe('mock-access-token');

    const user = await getCurrentUser();
    expect(user.displayName).toBe('Ranger One');
  });

  it('maps invalid credentials to the InvalidCredentials code', async () => {
    const failure = await loginUser({
      email: MOCK_CREDENTIALS.email,
      password: 'wrong-password',
    }).catch((error: unknown) => error as AppError);

    expect((failure as AppError).code).toBe(APP_ERROR_CODE.InvalidCredentials);
  });

  it('maps a locked account to Forbidden', async () => {
    const failure = await loginUser({
      email: MOCK_SCENARIO_EMAILS.forbidden,
      password: 'Whatever#123',
    }).catch((error: unknown) => error as AppError);

    expect((failure as AppError).code).toBe(APP_ERROR_CODE.Forbidden);
  });

  it('maps rate limiting and server failures to their codes', async () => {
    const rateLimited = await loginUser({
      email: MOCK_SCENARIO_EMAILS.rateLimited,
      password: 'Whatever#123',
    }).catch((error: unknown) => error as AppError);
    const serverError = await loginUser({
      email: MOCK_SCENARIO_EMAILS.serverError,
      password: 'Whatever#123',
    }).catch((error: unknown) => error as AppError);

    expect((rateLimited as AppError).code).toBe(APP_ERROR_CODE.RateLimited);
    expect((serverError as AppError).code).toBe(APP_ERROR_CODE.Server);
  });

  it('classifies a dropped connection as offline', async () => {
    mockApiServer.use(
      http.post(`${getEnvironment().apiBaseUrl}/auth/login`, () => HttpResponse.error()),
    );

    const failure = await loginUser({
      email: MOCK_CREDENTIALS.email,
      password: MOCK_CREDENTIALS.password,
    }).catch((error: unknown) => error as AppError);

    expect((failure as AppError).code).toBe(APP_ERROR_CODE.NetworkOffline);
  });

  it('bootstraps the session from stored tokens and clears on logout', async () => {
    await loginUser({ email: MOCK_CREDENTIALS.email, password: MOCK_CREDENTIALS.password });
    await bootstrapSessionFromStoredTokens();
    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Authenticated);

    await logoutUser();
    await expect(getAuthTokenRepository().getAccessToken()).resolves.toBeNull();

    await bootstrapSessionFromStoredTokens();
    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Anonymous);
  });
});
