import {
  bootstrapSessionFromStoredTokens,
  createRefreshExecutor,
  getAuthTokenRepository,
  handleAuthFailure,
} from '@/modules/auth';
import { getEnvironment } from '@/packages/environment';
import { initErrorReporting } from '@/packages/error-reporting';
import { configureAppHttpClient, createHttpClient } from '@/packages/http';
import { initI18n } from '@/packages/i18n';
import { setupIonicReact } from '@/packages/ionic';
import { getPlatformLogger } from '@/platform';
import { API_MODE } from '@/shared/enums';

import { buildI18nResources } from './i18n-resources.helper';

async function startMockModeIfEnabled(): Promise<void> {
  const environment = getEnvironment();
  if (environment.apiMode !== API_MODE.Mock || environment.isProduction) {
    return;
  }
  const { startMockWorker } = await import('@/tests/msw/browser');
  await startMockWorker();
}

/**
 * Composition root. Wires validated environment, i18n, the HTTP owner
 * (with the auth module's token store and refresh executor), error
 * reporting, mock mode, and the initial session snapshot — in that order.
 */
export async function startApp(): Promise<void> {
  // Must run before any Ionic component renders: it installs the Ionic
  // config and component styles. Without it components mount unstyled and
  // controlled values never reach their properties.
  setupIonicReact();
  const environment = getEnvironment();
  await initI18n({
    resources: buildI18nResources(),
    defaultLocale: environment.defaultLocale,
    supportedLocales: environment.supportedLocales,
  });
  configureAppHttpClient(
    createHttpClient({
      config: { baseUrl: environment.apiBaseUrl, timeoutMs: environment.apiTimeoutMs },
      tokenStore: getAuthTokenRepository(),
      refreshExecutor: createRefreshExecutor(),
      onAuthFailure: handleAuthFailure,
      logger: getPlatformLogger('http'),
    }),
  );
  initErrorReporting({ dsn: environment.sentryDsn, environment: environment.mode });
  await startMockModeIfEnabled();
  await bootstrapSessionFromStoredTokens();
}
