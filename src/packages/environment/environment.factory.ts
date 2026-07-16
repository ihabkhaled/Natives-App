import { safeParseWithSchema } from '@/packages/schema';

import { rawEnvironmentSchema } from './environment.schema';
import type { AppEnvironment, RawEnvironmentSource } from './environment.types';

export function createEnvironment(source: RawEnvironmentSource): AppEnvironment {
  const parsed = safeParseWithSchema(rawEnvironmentSchema, source);
  if (!parsed.success) {
    const details = parsed.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
    throw new Error(`Invalid environment configuration. ${details}`);
  }
  const raw = parsed.data;
  const defaultLocale = raw.VITE_SUPPORTED_LOCALES.includes(raw.VITE_DEFAULT_LOCALE)
    ? raw.VITE_DEFAULT_LOCALE
    : raw.VITE_SUPPORTED_LOCALES[0];
  if (defaultLocale === undefined) {
    throw new Error('Invalid environment configuration. VITE_SUPPORTED_LOCALES is empty.');
  }
  return Object.freeze({
    appName: raw.VITE_APP_NAME,
    appId: raw.VITE_APP_ID,
    apiBaseUrl: raw.VITE_API_BASE_URL,
    apiMode: raw.VITE_API_MODE,
    apiTimeoutMs: raw.VITE_API_TIMEOUT_MS,
    defaultLocale,
    supportedLocales: raw.VITE_SUPPORTED_LOCALES,
    defaultTheme: raw.VITE_DEFAULT_THEME,
    sentryDsn: raw.VITE_SENTRY_DSN,
    socketUrl: raw.VITE_SOCKET_URL,
    enableQueryDevtools: raw.VITE_ENABLE_QUERY_DEVTOOLS,
    isDevelopment: raw.DEV,
    isProduction: raw.PROD,
    mode: raw.MODE,
  });
}
