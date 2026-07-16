import { describe, expect, it } from 'vitest';

import { APP_IDENTITY } from './app-identity.constants';

describe('APP_IDENTITY', () => {
  it('pins the identity that native project generation derives from', () => {
    expect(APP_IDENTITY).toEqual({
      appId: 'com.capacitorranger.app',
      appName: 'Capacitor Ranger',
      appSlug: 'capacitor-ranger',
      packageScope: '@app',
    });
  });

  it('uses a reverse-DNS app id with at least three segments', () => {
    const segments = APP_IDENTITY.appId.split('.');
    expect(segments.length).toBeGreaterThanOrEqual(3);
    expect(segments.filter((segment) => segment === '')).toEqual([]);
  });

  it('derives the app id from the slug', () => {
    expect(APP_IDENTITY.appId).toContain(APP_IDENTITY.appSlug.replaceAll('-', ''));
  });

  it('uses a lower-case kebab slug safe for storage keys and package names', () => {
    expect(APP_IDENTITY.appSlug).toBe(APP_IDENTITY.appSlug.toLowerCase());
    expect(APP_IDENTITY.appSlug).not.toContain(' ');
  });

  it('scopes workspace packages with an npm scope marker', () => {
    expect(APP_IDENTITY.packageScope.startsWith('@')).toBe(true);
  });
});
