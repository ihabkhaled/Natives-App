import {
  createRefreshExecutor,
  getAuthTokenRepository,
  handleAuthFailure,
  SESSION_STATUS,
} from '@/modules/auth';
import { loginUser } from '@/modules/auth/services/login.service';
import { useSessionStore } from '@/modules/auth/store/session.store';
import { getEnvironment } from '@/packages/environment';
import {
  configureAppHttpClient,
  createHttpClient,
  resetAppHttpClientForTesting,
} from '@/packages/http';
import { MOCK_CREDENTIALS } from '@/tests/msw/mock-data.constants';

/** Wire the real HTTP client (auth token store + refresh) for MSW-backed tests. */
export function installRealHttpClient(): void {
  configureAppHttpClient(
    createHttpClient({
      config: { baseUrl: getEnvironment().apiBaseUrl, timeoutMs: 2000 },
      tokenStore: getAuthTokenRepository(),
      refreshExecutor: createRefreshExecutor(),
      onAuthFailure: handleAuthFailure,
    }),
  );
}

/** Sign in a persona and mark the session authenticated. */
export async function signInAs(email: string): Promise<void> {
  await loginUser({ email, password: MOCK_CREDENTIALS.password });
  useSessionStore.setState({ status: SESSION_STATUS.Authenticated });
}

/** Per-test setup: fresh client and an anonymous, empty session. */
export async function resetSessionForTest(): Promise<void> {
  resetAppHttpClientForTesting();
  installRealHttpClient();
  await getAuthTokenRepository().clearTokens();
  useSessionStore.setState({ status: SESSION_STATUS.Unknown });
}

/** Per-test teardown: clear tokens and reset the session. */
export async function clearSessionAfterTest(): Promise<void> {
  await getAuthTokenRepository().clearTokens();
  useSessionStore.setState({ status: SESSION_STATUS.Unknown });
}
