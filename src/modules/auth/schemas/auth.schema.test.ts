import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';

import { buildAuthMembership } from '../factories/auth.factory';
import {
  authAckSchema,
  authMembershipDtoSchema,
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
  memberships: [buildAuthMembership({ teamId: 'team-1', teamName: 'Team One' })],
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

  it('rejects a membership missing its team identity', () => {
    expect(
      safeParseWithSchema(authUserDtoSchema, {
        ...validUser,
        memberships: [{ teamId: 'team-1', teamName: 'Team One' }],
      }).success,
    ).toBe(false);
  });

  it('accepts a membership on a team that has no season yet', () => {
    const seasonless = buildAuthMembership({
      seasonId: null,
      seasonSlug: null,
      seasonName: null,
    });

    expect(
      safeParseWithSchema(authUserDtoSchema, { ...validUser, memberships: [seasonless] }).success,
    ).toBe(true);
  });

  it('rejects a membership whose lifecycle status is outside the canonical set', () => {
    expect(
      safeParseWithSchema(authUserDtoSchema, {
        ...validUser,
        memberships: [buildAuthMembership({ status: 'retired' as never })],
      }).success,
    ).toBe(false);
  });
});

describe('authMembershipDtoSchema', () => {
  it('accepts the real membership envelope with its role slugs', () => {
    const parsed = safeParseWithSchema(
      authMembershipDtoSchema,
      buildAuthMembership({ roles: ['member', 'team_admin'] }),
    );

    expect(parsed.success).toBe(true);
  });

  it('rejects an empty season id rather than treating it as absent', () => {
    expect(
      safeParseWithSchema(authMembershipDtoSchema, buildAuthMembership({ seasonId: '' })).success,
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
  const validRefresh = {
    ...validTokens,
    refreshTokenExpiresAt: '2026-08-18T12:00:00.000Z',
    userId: 'user-1',
  };

  it('accepts a rotated session response', () => {
    expect(safeParseWithSchema(refreshResponseSchema, validRefresh)).toEqual({
      success: true,
      data: validRefresh,
    });
  });

  it('rejects a response without the rotated tokens', () => {
    expect(safeParseWithSchema(refreshResponseSchema, {}).success).toBe(false);
  });

  it('rejects a malformed refresh expiry', () => {
    expect(
      safeParseWithSchema(refreshResponseSchema, {
        ...validRefresh,
        refreshTokenExpiresAt: 'tomorrow',
      }).success,
    ).toBe(false);
  });
});

describe('logoutResponseSchema', () => {
  it('accepts the acknowledgement envelope', () => {
    expect(
      safeParseWithSchema(logoutResponseSchema, {
        message: 'identity.session.revoked',
      }),
    ).toEqual({
      success: true,
      data: { message: 'identity.session.revoked' },
    });
  });

  it('rejects an empty acknowledgement', () => {
    expect(safeParseWithSchema(logoutResponseSchema, { message: '' }).success).toBe(false);
  });
});

describe('authAckSchema', () => {
  it('accepts a message acknowledgement and rejects an empty one', () => {
    expect(
      safeParseWithSchema(authAckSchema, {
        message: 'identity.password.reset.requested',
      }).success,
    ).toBe(true);
    expect(safeParseWithSchema(authAckSchema, { message: '' }).success).toBe(false);
  });
});

describe('invitationDetailsDtoSchema', () => {
  const valid = {
    email: 'invitee@example.com',
    role: 'user',
    inviterName: null,
    teamRole: 'coach',
    teamId: 'team-natives',
    teamName: 'Cairo Natives',
    expiresAt: '2026-08-01T12:00:00.000Z',
  };

  it('accepts the exact public invitation projection including a missing inviter', () => {
    expect(safeParseWithSchema(invitationDetailsDtoSchema, valid)).toEqual({
      success: true,
      data: valid,
    });
  });

  it('accepts a platform-scoped invitation without a team', () => {
    expect(
      safeParseWithSchema(invitationDetailsDtoSchema, { ...valid, teamId: null, teamName: null })
        .success,
    ).toBe(true);
  });

  it('accepts an unseen team-role slug — the catalog is server-owned', () => {
    expect(
      safeParseWithSchema(invitationDetailsDtoSchema, { ...valid, teamRole: 'physio_lead' })
        .success,
    ).toBe(true);
  });

  it('rejects a malformed team-role slug shape', () => {
    expect(
      safeParseWithSchema(invitationDetailsDtoSchema, { ...valid, teamRole: 'Coach!' }).success,
    ).toBe(false);
  });

  it('rejects an invalid email, role, and expiry instant', () => {
    expect(safeParseWithSchema(invitationDetailsDtoSchema, { ...valid, email: 'x' }).success).toBe(
      false,
    );
    expect(
      safeParseWithSchema(invitationDetailsDtoSchema, { ...valid, role: 'coach' }).success,
    ).toBe(false);
    expect(
      safeParseWithSchema(invitationDetailsDtoSchema, { ...valid, expiresAt: 'tomorrow' }).success,
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
    expect(
      safeParseWithSchema(sessionListResponseSchema, {
        sessions: [session],
        total: 1,
        limit: 20,
        offset: 0,
      }).success,
    ).toBe(true);
  });

  it('rejects a session without an id', () => {
    expect(safeParseWithSchema(sessionDtoSchema, { ...session, id: '' }).success).toBe(false);
  });

  it('rejects a list without the backend pagination metadata', () => {
    expect(safeParseWithSchema(sessionListResponseSchema, { sessions: [session] }).success).toBe(
      false,
    );
  });

  it('accepts a non-negative revoked count and rejects a negative one', () => {
    expect(safeParseWithSchema(revokeOthersResponseSchema, { revokedCount: 2 }).success).toBe(true);
    expect(safeParseWithSchema(revokeOthersResponseSchema, { revokedCount: -1 }).success).toBe(
      false,
    );
  });
});
