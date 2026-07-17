import { afterEach, describe, expect, it, vi } from 'vitest';

import { getPlatformLogger } from './platform-logger.facade';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getPlatformLogger', () => {
  it('memoizes one logger per scope', () => {
    const first = getPlatformLogger('memoized-scope');
    const second = getPlatformLogger('memoized-scope');

    expect(second).toBe(first);
  });

  it('creates an independent logger per scope', () => {
    expect(getPlatformLogger('scope-a')).not.toBe(getPlatformLogger('scope-b'));
  });

  it('exposes the full log-level surface', () => {
    const logger = getPlatformLogger('surface');

    expect(Object.keys(logger).sort()).toEqual(['debug', 'error', 'info', 'warn']);
  });

  it('prefixes messages with the scope and redacts sensitive fields', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    getPlatformLogger('http').info('request sent', { requestId: 'req-1', token: 'super-secret' });

    expect(infoSpy).toHaveBeenCalledExactlyOnceWith('[http] request sent', {
      requestId: 'req-1',
      token: '[REDACTED]',
    });
  });

  it('routes errors to the console error channel', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    getPlatformLogger('boot').error('startup failed');

    expect(errorSpy).toHaveBeenCalledExactlyOnceWith('[boot] startup failed');
  });

  it('routes warnings to the console warn channel', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    getPlatformLogger('sync').warn('retrying');

    expect(warnSpy).toHaveBeenCalledExactlyOnceWith('[sync] retrying');
  });
});
