import { describe, expect, it } from 'vitest';

import { parseDeepLink } from '@/platform';
import { APP_IDENTITY, APP_PATHS } from '@/shared/config';

import { APP_DEEP_LINK_POLICY } from './deep-link-policy.constants';

describe('APP_DEEP_LINK_POLICY', () => {
  it('allows https and the app custom scheme only', () => {
    expect(APP_DEEP_LINK_POLICY.allowedSchemes).toEqual(['https', APP_IDENTITY.appId]);
    expect(APP_DEEP_LINK_POLICY.allowedSchemes).toEqual(['https', 'com.ultimatenatives.app']);
  });

  it('never allows an unencrypted scheme', () => {
    expect(APP_DEEP_LINK_POLICY.allowedSchemes).not.toContain('http');
  });

  it('allows the production host and local development only', () => {
    expect(APP_DEEP_LINK_POLICY.allowedHosts).toEqual(['ultimatenatives.app', 'localhost']);
  });

  it('allows exactly the canonical route table as path prefixes', () => {
    expect(APP_DEEP_LINK_POLICY.allowedPathPrefixes).toEqual(Object.values(APP_PATHS));
    expect([...APP_DEEP_LINK_POLICY.allowedPathPrefixes].sort()).toEqual([
      '/',
      '/accept-invitation',
      '/admin',
      '/admin/operations',
      '/admin/roles',
      '/admin/rules',
      '/admin/settings',
      '/assessments',
      '/assessments/:assessmentId',
      '/competitions',
      '/competitions/:competitionId',
      '/forgot-password',
      '/home',
      '/leaderboard',
      '/login',
      '/matches',
      '/matches/:matchId',
      '/matches/:matchId/statistics',
      '/members',
      '/members/:membershipId',
      '/notifications',
      '/notifications/open/:notificationId',
      '/notifications/preferences',
      '/performance',
      '/points',
      '/practices',
      '/practices/:sessionId',
      '/practices/:sessionId/attendance',
      '/reset-password',
      '/rosters',
      '/rosters/:rosterId',
      '/sessions',
      '/settings',
      '/squads',
      '/squads/:squadId',
      '/training',
      '/training-review',
      '/training/:submissionId',
      '/tryout-registration',
      '/tryouts',
      '/tryouts/:tryoutId',
      '/welcome',
      '/workbench',
    ]);
  });

  it('admits a link to a real screen', () => {
    expect(parseDeepLink('https://ultimatenatives.app/home', APP_DEEP_LINK_POLICY)).toMatchObject({
      ok: true,
      value: '/home',
    });
  });

  it('admits a link opened through the app custom scheme', () => {
    expect(
      parseDeepLink('com.ultimatenatives.app://ultimatenatives.app/settings', APP_DEEP_LINK_POLICY)
        .ok,
    ).toBe(true);
  });

  it('rejects a link from a look-alike host', () => {
    expect(
      parseDeepLink('https://ultimatenatives.app.evil.com/home', APP_DEEP_LINK_POLICY).ok,
    ).toBe(false);
  });

  it('rejects a plain http link', () => {
    expect(parseDeepLink('http://ultimatenatives.app/home', APP_DEEP_LINK_POLICY).ok).toBe(false);
  });
});
