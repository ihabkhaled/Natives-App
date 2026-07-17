import { describe, expect, it } from 'vitest';

import { toAxiosRequestConfig } from './axios-config.helper';

describe('toAxiosRequestConfig', () => {
  it('produces an empty config without options', () => {
    expect(toAxiosRequestConfig()).toEqual({});
  });

  it('produces an empty config for empty options', () => {
    expect(toAxiosRequestConfig({})).toEqual({});
  });

  it('forwards an abort signal by reference', () => {
    const controller = new AbortController();

    expect(toAxiosRequestConfig({ signal: controller.signal }).signal).toBe(controller.signal);
  });

  it('copies headers instead of aliasing the caller object', () => {
    const headers = { 'X-Trace': 'trace-1' };

    const config = toAxiosRequestConfig({ headers });

    expect(config.headers).toEqual({ 'X-Trace': 'trace-1' });
    expect(config.headers).not.toBe(headers);
  });

  it('copies params instead of aliasing the caller object', () => {
    const params = { page: 2, active: true, q: 'ranger' };

    const config = toAxiosRequestConfig({ params });

    expect(config.params).toEqual({ page: 2, active: true, q: 'ranger' });
    expect(config.params).not.toBe(params);
  });

  it('maps the timeout onto the axios key', () => {
    expect(toAxiosRequestConfig({ timeoutMs: 250 }).timeout).toBe(250);
  });

  it('marks a request that skips auth', () => {
    expect(toAxiosRequestConfig({ skipAuth: true }).appSkipAuth).toBe(true);
  });

  it('marks a request that skips the unauthorized replay', () => {
    expect(toAxiosRequestConfig({ skipRetryOnUnauthorized: true }).appSkipRetryOnUnauthorized).toBe(
      true,
    );
  });

  it('omits the flags when they are explicitly false', () => {
    const config = toAxiosRequestConfig({ skipAuth: false, skipRetryOnUnauthorized: false });

    expect(config).toEqual({});
    expect('appSkipAuth' in config).toBe(false);
    expect('appSkipRetryOnUnauthorized' in config).toBe(false);
  });

  it('maps every option at once', () => {
    const controller = new AbortController();

    expect(
      toAxiosRequestConfig({
        signal: controller.signal,
        headers: { 'X-Trace': 'trace-1' },
        params: { page: 2 },
        timeoutMs: 500,
        skipAuth: true,
        skipRetryOnUnauthorized: true,
      }),
    ).toEqual({
      signal: controller.signal,
      headers: { 'X-Trace': 'trace-1' },
      params: { page: 2 },
      timeout: 500,
      appSkipAuth: true,
      appSkipRetryOnUnauthorized: true,
    });
  });

  it('never carries the app flags into axios-native keys', () => {
    const config = toAxiosRequestConfig({ skipAuth: true });

    expect(config.headers).toBeUndefined();
    expect(config.params).toBeUndefined();
    expect(config.timeout).toBeUndefined();
    expect(config.signal).toBeUndefined();
  });
});
