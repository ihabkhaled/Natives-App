import { describe, expect, it } from 'vitest';

import { createEnvironment } from './environment.factory';
import type { RawEnvironmentSource } from './environment.types';

const VALID_SOURCE = {
  VITE_APP_NAME: 'Capacitor Ranger',
  VITE_APP_ID: 'com.capacitorranger.app',
  VITE_API_BASE_URL: 'http://localhost:3000/api/v1',
  VITE_API_MODE: 'mock',
  VITE_API_TIMEOUT_MS: '5000',
  VITE_DEFAULT_LOCALE: 'en',
  VITE_SUPPORTED_LOCALES: 'en,ar',
  VITE_DEFAULT_THEME: 'system',
  VITE_SENTRY_DSN: '',
  VITE_SOCKET_URL: '',
  VITE_ENABLE_QUERY_DEVTOOLS: 'false',
} as const;

function buildSource(overrides: Readonly<Record<string, unknown>> = {}): RawEnvironmentSource {
  return { ...VALID_SOURCE, ...overrides };
}

describe('createEnvironment', () => {
  it('maps a valid source onto the application environment', () => {
    expect(createEnvironment(buildSource())).toEqual({
      appName: 'Capacitor Ranger',
      appId: 'com.capacitorranger.app',
      apiBaseUrl: 'http://localhost:3000/api/v1',
      apiMode: 'mock',
      apiTimeoutMs: 5000,
      defaultLocale: 'en',
      supportedLocales: ['en', 'ar'],
      defaultTheme: 'system',
      sentryDsn: undefined,
      socketUrl: undefined,
      enableQueryDevtools: false,
      isDevelopment: false,
      isProduction: false,
      mode: 'development',
    });
  });

  it('freezes the environment so nothing can mutate it later', () => {
    expect(Object.isFrozen(createEnvironment(buildSource()))).toBe(true);
  });

  it('coerces the timeout to a number', () => {
    expect(createEnvironment(buildSource({ VITE_API_TIMEOUT_MS: '250' })).apiTimeoutMs).toBe(250);
  });

  it('keeps optional urls when they are provided', () => {
    const environment = createEnvironment(
      buildSource({
        VITE_SENTRY_DSN: 'https://public@sentry.example.com/1',
        VITE_SOCKET_URL: 'wss://socket.example.com',
      }),
    );

    expect(environment.sentryDsn).toBe('https://public@sentry.example.com/1');
    expect(environment.socketUrl).toBe('wss://socket.example.com');
  });

  it('reads the query devtools flag', () => {
    expect(
      createEnvironment(buildSource({ VITE_ENABLE_QUERY_DEVTOOLS: 'true' })).enableQueryDevtools,
    ).toBe(true);
  });

  it('reads the vite build flags', () => {
    const environment = createEnvironment(buildSource({ DEV: true, PROD: false, MODE: 'test' }));

    expect(environment.isDevelopment).toBe(true);
    expect(environment.isProduction).toBe(false);
    expect(environment.mode).toBe('test');
  });

  it('trims whitespace around csv locales', () => {
    expect(
      createEnvironment(buildSource({ VITE_SUPPORTED_LOCALES: ' en , ar , fr ' })).supportedLocales,
    ).toEqual(['en', 'ar', 'fr']);
  });

  it('falls back to the first supported locale when the default is unsupported', () => {
    const environment = createEnvironment(
      buildSource({ VITE_DEFAULT_LOCALE: 'de', VITE_SUPPORTED_LOCALES: 'ar,en' }),
    );

    expect(environment.defaultLocale).toBe('ar');
  });

  it.each([
    ['an empty app name', { VITE_APP_NAME: '' }],
    ['a single-segment app id', { VITE_APP_ID: 'app' }],
    ['an app id segment starting with a digit', { VITE_APP_ID: 'com.1ranger' }],
    ['an app id segment with a dash', { VITE_APP_ID: 'com.capacitor-ranger' }],
    ['a non-url api base', { VITE_API_BASE_URL: '/api/v1' }],
    ['an unknown api mode', { VITE_API_MODE: 'live' }],
    ['a non-numeric timeout', { VITE_API_TIMEOUT_MS: 'soon' }],
    ['a fractional timeout', { VITE_API_TIMEOUT_MS: '10.5' }],
    ['a zero timeout', { VITE_API_TIMEOUT_MS: '0' }],
    ['a timeout above the cap', { VITE_API_TIMEOUT_MS: '120001' }],
    ['a one-character default locale', { VITE_DEFAULT_LOCALE: 'e' }],
    ['an empty supported locales list', { VITE_SUPPORTED_LOCALES: '' }],
    ['a one-character supported locale', { VITE_SUPPORTED_LOCALES: 'en,a' }],
    ['an unknown default theme', { VITE_DEFAULT_THEME: 'contrast' }],
    ['a malformed sentry dsn', { VITE_SENTRY_DSN: 'not-a-url' }],
    ['a malformed socket url', { VITE_SOCKET_URL: 'not-a-url' }],
    ['a non-boolean devtools flag', { VITE_ENABLE_QUERY_DEVTOOLS: 'yes' }],
  ])('rejects %s', (_label, overrides) => {
    expect(() => createEnvironment(buildSource(overrides))).toThrow(
      /^Invalid environment configuration\./u,
    );
  });

  it('rejects a missing required key', () => {
    const { VITE_APP_NAME: _omitted, ...withoutName } = VALID_SOURCE;

    expect(() => createEnvironment(withoutName)).toThrow(/VITE_APP_NAME/u);
  });

  it('names every offending key in the failure message', () => {
    expect(() =>
      createEnvironment(buildSource({ VITE_APP_NAME: '', VITE_API_MODE: 'live' })),
    ).toThrow(/VITE_APP_NAME.*VITE_API_MODE/su);
  });

  it('accepts an app id with more than two segments', () => {
    expect(createEnvironment(buildSource({ VITE_APP_ID: 'com.example.ranger.app' })).appId).toBe(
      'com.example.ranger.app',
    );
  });

  it('applies schema defaults for the optional keys', () => {
    const {
      VITE_SENTRY_DSN: _dsn,
      VITE_SOCKET_URL: _socket,
      VITE_ENABLE_QUERY_DEVTOOLS: _devtools,
      ...withoutOptionals
    } = VALID_SOURCE;

    const environment = createEnvironment(withoutOptionals);

    expect(environment.sentryDsn).toBeUndefined();
    expect(environment.socketUrl).toBeUndefined();
    expect(environment.enableQueryDevtools).toBe(false);
    expect(environment.mode).toBe('development');
  });
});
