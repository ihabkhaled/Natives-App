import { describe, expect, it } from 'vitest';

import { buildAuthMembership } from '../factories/auth.factory';
import {
  mapAuthSessionResponseToTokens,
  mapLoginResponseToSession,
  mapUserDtoToAuthUser,
} from './auth.mapper';

const membership = buildAuthMembership({ teamId: 'team-1', teamName: 'Team One' });

const wireUser = {
  id: 'user-1',
  email: 'ranger@example.com',
  displayName: 'Ranger One',
  permissions: ['members.read', 'users.manage'],
  accountState: 'active' as const,
  onboardingComplete: true,
  memberships: [membership],
};

describe('mapUserDtoToAuthUser', () => {
  it('maps every wire field onto the domain user', () => {
    expect(mapUserDtoToAuthUser(wireUser)).toEqual({
      id: 'user-1',
      email: 'ranger@example.com',
      displayName: 'Ranger One',
      permissions: ['members.read', 'users.manage'],
      accountState: 'active',
      onboardingComplete: true,
      memberships: [membership],
    });
  });

  it('lowercases the email so identity comparisons stay stable', () => {
    const user = mapUserDtoToAuthUser({ ...wireUser, email: 'Ranger@Example.COM' });

    expect(user.email).toBe('ranger@example.com');
  });

  it('trims surrounding whitespace from the display name', () => {
    const user = mapUserDtoToAuthUser({ ...wireUser, displayName: '  Ranger One  ' });

    expect(user.displayName).toBe('Ranger One');
  });

  it('carries the effective permissions and team memberships through', () => {
    const user = mapUserDtoToAuthUser({ ...wireUser, accountState: 'suspended' });

    expect(user.permissions).toEqual(['members.read', 'users.manage']);
    expect(user.accountState).toBe('suspended');
    expect(user.memberships).toEqual([membership]);
  });
});

describe('mapLoginResponseToSession', () => {
  it('maps the login envelope into a session with a normalized user', () => {
    const session = mapLoginResponseToSession({
      tokens: { accessToken: 'access-1', refreshToken: 'refresh-1' },
      user: { ...wireUser, email: 'Ranger@Example.com', displayName: ' Ranger One ' },
    });

    expect(session).toEqual({
      user: {
        id: 'user-1',
        email: 'ranger@example.com',
        displayName: 'Ranger One',
        permissions: ['members.read', 'users.manage'],
        accountState: 'active',
        onboardingComplete: true,
        memberships: [membership],
      },
      tokens: { accessToken: 'access-1', refreshToken: 'refresh-1' },
    });
  });

  it('copies the token pair without carrying extra wire fields', () => {
    const session = mapLoginResponseToSession({
      tokens: { accessToken: 'access-9', refreshToken: 'refresh-9' },
      user: { ...wireUser, id: 'user-2', email: 'two@example.com', displayName: 'Two' },
    });

    expect(Object.keys(session.tokens)).toEqual(['accessToken', 'refreshToken']);
    expect(session.tokens.accessToken).toBe('access-9');
    expect(session.tokens.refreshToken).toBe('refresh-9');
  });
});

describe('mapAuthSessionResponseToTokens', () => {
  it('keeps only the access and refresh tokens from a flat session response', () => {
    expect(
      mapAuthSessionResponseToTokens({
        accessToken: 'access-2',
        refreshToken: 'refresh-2',
        refreshTokenExpiresAt: '2026-08-18T12:00:00.000Z',
        userId: 'user-2',
      }),
    ).toEqual({
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    });
  });
});
