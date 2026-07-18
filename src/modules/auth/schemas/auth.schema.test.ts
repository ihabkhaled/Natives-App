import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';

import {
  authAckSchema,
  authTokensDtoSchema,
  authUserDtoSchema,
  invitationDetailsDtoSchema,
  loginResponseSchema,
  logoutResponseSchema,
  refreshResponseSchema,
  revokeOthersResponseSchema,
  sessionDtoSchema,
  sessionListResponseSchema,
} from './auth.schema';

const validUser = {
  id: 'user-1',
  email: 'ranger@example.com',
  displayName: 'Ranger One',
  permissions: ['members.read', 'users.manage'],
  accountState: 'active',
  onboardingComplete: true,
  memberships: [
    { teamId: 'team-1', teamName: 'Team One', seasonId: 'season-1', seasonName: 'Season One' },
  ],
};
const validTokens = { accessToken: 'access-1', refreshToken: 'refresh-1' };

describe('authUserDtoSchema', () => {
  it('accepts a well-formed user payload', () => {
    expect(safeParseWithSchema(authUserDtoSchema, validUser)).toEqual({
      success: true,
      data: validUser,
    });
  });

  it('rejects a malformed email address', () => {
    const result = safeParseWithSchema(authUserDtoSchema, { ...validUser, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty id and an empty display name', () => {
    expect(safeParseWithSchema(authUserDtoSchema, { ...validUser, id: '' }).success).toBe(false);
    expect(safeParseWithSchema(authUserDtoSchema, { ...validUser, displayName: '' }).success).toBe(
      false,
    );
  });

  it('rejects an account state outside the canonical set', () => {
    expect(
      safeParseWithSchema(authUserDtoSchema, { ...validUser, accountState: 'banned' }).success,
    ).toBe(false);
  });

  it('rejects a membership missing its season scope', () => {
    expect(
      safeParseWithSchema(authUserDtoSchema, {
        ...validUser,
        memberships: [{ teamId: 'team-1', teamName: 'Team One' }],
      }).success,
    ).toBe(false);
  });
});

describe('authTokensDtoSchema', () => {
  it('accepts a well-formed token pair', () => {
    expect(safeParseWithSchema(authTokensDtoSchema, validTokens)).toEqual({
      success: true,
      data: validTokens,
    });
  });

  it('rejects a pair that is missing the refresh token', () => {
    const result = safeParseWithSchema(authTokensDtoSchema, { accessToken: 'access-1' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty access token', () => {
    expect(
      safeParseWithSchema(authTokensDtoSchema, { ...validTokens, accessToken: '' }).success,
    ).toBe(false);
  });
});

describe('loginResponseSchema', () => {
  it('accepts the full login envelope', () => {
    expect(
      safeParseWithSchema(loginResponseSchema, { tokens: validTokens, user: validUser }),
    ).toEqual({ success: true, data: { tokens: validTokens, user: validUser } });
  });

  it('rejects an envelope whose nested user violates the user contract', () => {
    const result = safeParseWithSchema(loginResponseSchema, {
      tokens: validTokens,
      user: { ...validUser, email: 'nope' },
    });
    expect(result.success).toBe(false);
  });
});

describe('refreshResponseSchema', () => {
  it('accepts a rotated token envelope', () => {
    expect(safeParseWithSchema(refreshResponseSchema, { tokens: validTokens })).toEqual({
      success: true,
      data: { tokens: validTokens },
    });
  });

  it('rejects an envelope without tokens', () => {
    expect(safeParseWithSchema(refreshResponseSchema, {}).success).toBe(false);
  });
});

describe('logoutResponseSchema', () => {
  it('accepts the acknowledgement envelope', () => {
    expect(safeParseWithSchema(logoutResponseSchema, { success: true })).toEqual({
      success: true,
      data: { success: true },
    });
  });

  it('rejects a non-boolean acknowledgement', () => {
    expect(safeParseWithSchema(logoutResponseSchema, { success: 'yes' }).success).toBe(false);
  });
});

describe('authAckSchema', () => {
  it('accepts a boolean acknowledgement and rejects a non-boolean one', () => {
    expect(safeParseWithSchema(authAckSchema, { success: true }).success).toBe(true);
    expect(safeParseWithSchema(authAckSchema, { success: 1 }).success).toBe(false);
  });
});

describe('invitationDetailsDtoSchema', () => {
  const valid = {
    email: 'invitee@example.com',
    teamName: 'Cairo Natives',
    inviterName: 'Coach Nadia',
    expiresAt: '2026-08-01T12:00:00.000Z',
  };

  it('accepts a well-formed invitation payload', () => {
    expect(safeParseWithSchema(invitationDetailsDtoSchema, valid).success).toBe(true);
  });

  it('rejects an invalid email and an empty team name', () => {
    expect(safeParseWithSchema(invitationDetailsDtoSchema, { ...valid, email: 'x' }).success).toBe(
      false,
    );
    expect(
      safeParseWithSchema(invitationDetailsDtoSchema, { ...valid, teamName: '' }).success,
    ).toBe(false);
  });
});

describe('session schemas', () => {
  const session = {
    id: 'session-1',
    device: 'Chrome on macOS',
    approxLocation: 'Cairo, EG',
    lastActiveAt: '2026-07-18T09:30:00.000Z',
    current: true,
  };

  it('accepts a session and a session list', () => {
    expect(safeParseWithSchema(sessionDtoSchema, session).success).toBe(true);
    expect(safeParseWithSchema(sessionListResponseSchema, { sessions: [session] }).success).toBe(
      true,
    );
  });

  it('rejects a session without an id', () => {
    expect(safeParseWithSchema(sessionDtoSchema, { ...session, id: '' }).success).toBe(false);
  });

  it('accepts a non-negative revoked count and rejects a negative one', () => {
    expect(safeParseWithSchema(revokeOthersResponseSchema, { revokedCount: 2 }).success).toBe(true);
    expect(safeParseWithSchema(revokeOthersResponseSchema, { revokedCount: -1 }).success).toBe(
      false,
    );
  });
});
