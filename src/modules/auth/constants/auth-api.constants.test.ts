import { describe, expect, it } from 'vitest';

import { AUTH_API_PATHS, invitationDetailPath, sessionRevokePath } from './auth-api.constants';

describe('AUTH_API_PATHS', () => {
  it('pins every static auth endpoint to its versioned-base-relative path', () => {
    expect(AUTH_API_PATHS).toEqual({
      login: '/auth/login',
      refresh: '/auth/refresh',
      logout: '/auth/logout',
      currentUser: '/auth/me',
      passwordForgot: '/auth/forgot-password',
      passwordReset: '/auth/reset-password',
      invitations: '/auth/invitations',
      invitationAccept: '/invitations/accept',
      sessions: '/auth/sessions',
      sessionsRevokeOthers: '/auth/sessions/revoke-others',
    });
  });

  it('keeps every static path relative so the client base URL stays authoritative', () => {
    for (const path of Object.values(AUTH_API_PATHS)) {
      expect(path.startsWith('/')).toBe(true);
      expect(path).not.toContain('://');
    }
  });
});

describe('parameterized auth paths', () => {
  it('builds the invitation lookup path from a token', () => {
    expect(invitationDetailPath('abc')).toBe('/auth/invitations/abc');
  });

  it('builds the single-session revoke path from a session id', () => {
    expect(sessionRevokePath('session-2')).toBe('/auth/sessions/session-2/revoke');
  });

  it('encodes tokens and ids that contain URL-reserved characters', () => {
    expect(invitationDetailPath('a b/c')).toBe('/auth/invitations/a%20b%2Fc');
    expect(sessionRevokePath('a/b')).toBe('/auth/sessions/a%2Fb/revoke');
  });
});
