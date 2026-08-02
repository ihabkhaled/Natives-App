import { createRefreshExecutor, getAuthTokenRepository, handleAuthFailure } from '@/modules/auth';
import { getEnvironment } from '@/packages/environment';
import { configureAppHttpClient, createHttpClient } from '@/packages/http';

/**
 * Points the app's http client at the MSW-backed API, wired exactly as
 * production wires it — real refresh executor, real token store, real auth
 * failure handling. The three auth flow specs each stood up their own copy of
 * this, which is how a flow test can end up exercising a client that no longer
 * matches the one that ships.
 */
export function wireRealHttpClient(timeoutMs = 2000): void {
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
