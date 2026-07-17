import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';

import {
  authTokensDtoSchema,
  authUserDtoSchema,
  loginResponseSchema,
  logoutResponseSchema,
  refreshResponseSchema,
} from './auth.schema';

const validUser = { id: 'user-1', email: 'ranger@example.com', displayName: 'Ranger One' };
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
