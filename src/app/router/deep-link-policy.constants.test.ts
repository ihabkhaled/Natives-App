import { describe, expect, it } from 'vitest';

import { parseDeepLink } from '@/platform';
import { APP_IDENTITY, APP_PATHS } from '@/shared/config';

import { APP_DEEP_LINK_POLICY } from './deep-link-policy.constants';

describe('APP_DEEP_LINK_POLICY', () => {
  it('allows https and the app custom scheme only', () => {
    expect(APP_DEEP_LINK_POLICY.allowedSchemes).toEqual(['https', APP_IDENTITY.appId]);
    expect(APP_DEEP_LINK_POLICY.allowedSchemes).toEqual(['https', 'com.capacitorranger.app']);
  });

  it('never allows an unencrypted scheme', () => {
    expect(APP_DEEP_LINK_POLICY.allowedSchemes).not.toContain('http');
  });

  it('allows the production host and local development only', () => {
    expect(APP_DEEP_LINK_POLICY.allowedHosts).toEqual(['capacitorranger.app', 'localhost']);
  });

  it('allows exactly the canonical route table as path prefixes', () => {
    expect(APP_DEEP_LINK_POLICY.allowedPathPrefixes).toEqual(Object.values(APP_PATHS));
    expect([...APP_DEEP_LINK_POLICY.allowedPathPrefixes].sort()).toEqual([
      '/',
      '/home',
      '/login',
      '/settings',
      '/welcome',
      '/workbench',
    ]);
  });

  it('admits a link to a real screen', () => {
    expect(parseDeepLink('https://capacitorranger.app/home', APP_DEEP_LINK_POLICY)).toMatchObject({
      ok: true,
      value: '/home',
    });
  });

  it('admits a link opened through the app custom scheme', () => {
    expect(
      parseDeepLink('com.capacitorranger.app://capacitorranger.app/settings', APP_DEEP_LINK_POLICY)
        .ok,
    ).toBe(true);
  });

  it('rejects a link from a look-alike host', () => {
    expect(
      parseDeepLink('https://capacitorranger.app.evil.com/home', APP_DEEP_LINK_POLICY).ok,
    ).toBe(false);
  });

  it('rejects a plain http link', () => {
    expect(parseDeepLink('http://capacitorranger.app/home', APP_DEEP_LINK_POLICY).ok).toBe(false);
  });
});
