import { beforeEach, describe, expect, it } from 'vitest';

import {
  createRefreshExecutor,
  getAuthTokenRepository,
  handleAuthFailure,
  SESSION_STATUS,
} from '@/modules/auth';
import { getCurrentUser } from '@/modules/auth/services/get-current-user.service';
import { useSessionStore } from '@/modules/auth/store/session.store';
import { getEnvironment } from '@/packages/environment';
import {
  configureAppHttpClient,
  createHttpClient,
  resetAppHttpClientForTesting,
} from '@/packages/http';
import { APP_ERROR_CODE, type AppError } from '@/shared/errors';
import { MOCK_TOKENS } from '@/tests/msw/mock-data.constants';

import { mockApiServer } from '../setup/msw-server.setup';

function countRequests(pathSuffix: string): () => number {
  let count = 0;
  mockApiServer.events.on('request:start', ({ request }) => {
    if (new URL(request.url).pathname.endsWith(pathSuffix)) {
      count += 1;
    }
  });
  return () => count;
}

describe('token refresh (real client + MSW)', () => {
  beforeEach(async () => {
    resetAppHttpClientForTesting();
    const environment = getEnvironment();
    configureAppHttpClient(
      createHttpClient({
        config: { baseUrl: environment.apiBaseUrl, timeoutMs: 2000 },
        tokenStore: getAuthTokenRepository(),
        refreshExecutor: createRefreshExecutor(),
        onAuthFailure: handleAuthFailure,
      }),
    );
    await getAuthTokenRepository().clearTokens();
    useSessionStore.setState({ status: SESSION_STATUS.Authenticated });
    mockApiServer.events.removeAllListeners();
  });

  it('refreshes an expired access token and replays the request', async () => {
    await getAuthTokenRepository().setTokens({
      accessToken: 'expired-access-token',
      refreshToken: MOCK_TOKENS.refresh,
    });

    const user = await getCurrentUser();

    expect(user.email).toBe('ranger@example.com');
    await expect(getAuthTokenRepository().getAccessToken()).resolves.toBe(
      MOCK_TOKENS.rotatedAccess,
    );
  });

  it('collapses concurrent 401s into one refresh call', async () => {
    await getAuthTokenRepository().setTokens({
      accessToken: 'expired-access-token',
      refreshToken: MOCK_TOKENS.refresh,
    });
    const refreshCount = countRequests('/auth/refresh');

    const [first, second, third] = await Promise.all([
      getCurrentUser(),
      getCurrentUser(),
      getCurrentUser(),
    ]);

    expect(first.id).toBe(second.id);
    expect(second.id).toBe(third.id);
    expect(refreshCount()).toBe(1);
  });

  it('marks the session anonymous when the refresh token is rejected', async () => {
    await getAuthTokenRepository().setTokens({
      accessToken: 'expired-access-token',
      refreshToken: 'garbage-refresh-token',
    });

    const failure = await getCurrentUser().catch((error: unknown) => error as AppError);

    expect((failure as AppError).code).toBe(APP_ERROR_CODE.Unauthorized);
    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Anonymous);
    await expect(getAuthTokenRepository().getRefreshToken()).resolves.toBeNull();
  });
});
