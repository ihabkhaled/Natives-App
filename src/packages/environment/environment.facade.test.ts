import { afterEach, describe, expect, it } from 'vitest';

import { getEnvironment, resetEnvironmentCacheForTesting } from './environment.facade';

afterEach(() => {
  resetEnvironmentCacheForTesting();
});

describe('getEnvironment', () => {
  it('parses the vite environment loaded from .env.test', () => {
    const environment = getEnvironment();

    expect(environment.appName).toBe('Capacitor Ranger');
    expect(environment.appId).toBe('com.capacitorranger.app');
    expect(environment.apiBaseUrl).toBe('http://localhost:3000/api/v1');
    expect(environment.apiMode).toBe('mock');
    expect(environment.apiTimeoutMs).toBe(5000);
    expect(environment.defaultLocale).toBe('en');
    expect(environment.supportedLocales).toEqual(['en', 'ar']);
    expect(environment.defaultTheme).toBe('system');
    expect(environment.enableQueryDevtools).toBe(false);
  });

  it('leaves the optional integrations disabled in tests', () => {
    const environment = getEnvironment();

    expect(environment.sentryDsn).toBeUndefined();
    expect(environment.socketUrl).toBeUndefined();
  });

  it('reports the vite mode flags', () => {
    const environment = getEnvironment();

    expect(environment.mode).toBe('test');
    expect(environment.isProduction).toBe(false);
  });

  it('returns a frozen snapshot', () => {
    expect(Object.isFrozen(getEnvironment())).toBe(true);
  });

  it('caches the parsed environment across calls', () => {
    expect(getEnvironment()).toBe(getEnvironment());
  });
});

describe('resetEnvironmentCacheForTesting', () => {
  it('forces the next read to rebuild the environment', () => {
    const first = getEnvironment();

    resetEnvironmentCacheForTesting();
    const second = getEnvironment();

    expect(second).not.toBe(first);
    expect(second).toEqual(first);
  });
});
