import { describe, expect, it } from 'vitest';

import { AUTH_API_PATHS } from './auth-api.constants';

describe('AUTH_API_PATHS', () => {
  it('pins every auth endpoint to its versioned-base-relative path', () => {
    expect(AUTH_API_PATHS).toEqual({
      login: '/auth/login',
      refresh: '/auth/refresh',
      logout: '/auth/logout',
      currentUser: '/auth/me',
    });
  });

  it('keeps every path relative so the client base URL stays authoritative', () => {
    for (const path of Object.values(AUTH_API_PATHS)) {
      expect(path.startsWith('/')).toBe(true);
      expect(path).not.toContain('://');
    }
  });
});
