import { describe, expect, it } from 'vitest';

import { mapLoginResponseToSession, mapUserDtoToAuthUser } from './auth.mapper';

describe('mapUserDtoToAuthUser', () => {
  it('maps every wire field onto the domain user', () => {
    expect(
      mapUserDtoToAuthUser({
        id: 'user-1',
        email: 'ranger@example.com',
        displayName: 'Ranger One',
      }),
    ).toEqual({ id: 'user-1', email: 'ranger@example.com', displayName: 'Ranger One' });
  });

  it('lowercases the email so identity comparisons stay stable', () => {
    const user = mapUserDtoToAuthUser({
      id: 'user-1',
      email: 'Ranger@Example.COM',
      displayName: 'Ranger One',
    });

    expect(user.email).toBe('ranger@example.com');
  });

  it('trims surrounding whitespace from the display name', () => {
    const user = mapUserDtoToAuthUser({
      id: 'user-1',
      email: 'ranger@example.com',
      displayName: '  Ranger One  ',
    });

    expect(user.displayName).toBe('Ranger One');
  });
});

describe('mapLoginResponseToSession', () => {
  it('maps the login envelope into a session with a normalized user', () => {
    const session = mapLoginResponseToSession({
      tokens: { accessToken: 'access-1', refreshToken: 'refresh-1' },
      user: { id: 'user-1', email: 'Ranger@Example.com', displayName: ' Ranger One ' },
    });

    expect(session).toEqual({
      user: { id: 'user-1', email: 'ranger@example.com', displayName: 'Ranger One' },
      tokens: { accessToken: 'access-1', refreshToken: 'refresh-1' },
    });
  });

  it('copies the token pair without carrying extra wire fields', () => {
    const session = mapLoginResponseToSession({
      tokens: { accessToken: 'access-9', refreshToken: 'refresh-9' },
      user: { id: 'user-2', email: 'two@example.com', displayName: 'Two' },
    });

    expect(Object.keys(session.tokens)).toEqual(['accessToken', 'refreshToken']);
    expect(session.tokens.accessToken).toBe('access-9');
    expect(session.tokens.refreshToken).toBe('refresh-9');
  });
});
