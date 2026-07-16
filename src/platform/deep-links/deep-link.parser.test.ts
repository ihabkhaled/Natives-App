import { describe, expect, it } from 'vitest';

import { parseDeepLink, type DeepLinkPolicy } from './deep-link.parser';

const POLICY: DeepLinkPolicy = {
  allowedSchemes: ['https', 'capacitorranger'],
  allowedHosts: ['app.example.com'],
  allowedPathPrefixes: ['/home', '/settings'],
};

describe('parseDeepLink', () => {
  it('accepts an allowlisted https link and returns the internal route', () => {
    expect(parseDeepLink('https://app.example.com/home', POLICY)).toEqual({
      ok: true,
      value: '/home',
    });
  });

  it('accepts the custom app scheme', () => {
    expect(parseDeepLink('capacitorranger://app.example.com/settings', POLICY)).toEqual({
      ok: true,
      value: '/settings',
    });
  });

  it('preserves the query string on the internal route', () => {
    expect(parseDeepLink('https://app.example.com/home?tab=activity&ref=push', POLICY)).toEqual({
      ok: true,
      value: '/home?tab=activity&ref=push',
    });
  });

  it('drops the fragment, which never reaches the router', () => {
    expect(parseDeepLink('https://app.example.com/home#section', POLICY)).toEqual({
      ok: true,
      value: '/home',
    });
  });

  it('accepts a nested path under an allowed prefix', () => {
    expect(parseDeepLink('https://app.example.com/home/details?id=7', POLICY)).toEqual({
      ok: true,
      value: '/home/details?id=7',
    });
  });

  it('rejects an unparseable URL', () => {
    expect(parseDeepLink('not a url', POLICY)).toEqual({
      ok: false,
      error: { reason: 'unparseable' },
    });
  });

  it('rejects a scheme outside the allowlist', () => {
    expect(parseDeepLink('http://app.example.com/home', POLICY)).toEqual({
      ok: false,
      error: { reason: 'scheme' },
    });
  });

  it('rejects a host outside the allowlist', () => {
    expect(parseDeepLink('https://evil.example.com/home', POLICY)).toEqual({
      ok: false,
      error: { reason: 'host' },
    });
  });

  it('rejects a path outside the allowlist', () => {
    expect(parseDeepLink('https://app.example.com/admin', POLICY)).toEqual({
      ok: false,
      error: { reason: 'path' },
    });
  });

  it('rejects the root path when no prefix allows it', () => {
    expect(parseDeepLink('https://app.example.com/', POLICY)).toEqual({
      ok: false,
      error: { reason: 'path' },
    });
  });

  it('treats prefixes as path segments, not string prefixes', () => {
    expect(parseDeepLink('https://app.example.com/homework', POLICY)).toEqual({
      ok: false,
      error: { reason: 'path' },
    });
  });

  it('rejects every link when the policy allows nothing', () => {
    const closedPolicy: DeepLinkPolicy = {
      allowedSchemes: [],
      allowedHosts: [],
      allowedPathPrefixes: [],
    };

    expect(parseDeepLink('https://app.example.com/home', closedPolicy)).toEqual({
      ok: false,
      error: { reason: 'scheme' },
    });
  });
});
