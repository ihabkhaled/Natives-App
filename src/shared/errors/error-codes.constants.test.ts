import { describe, expect, it } from 'vitest';

import { APP_ERROR_CODE } from './error-codes.constants';

const VALUES = Object.values(APP_ERROR_CODE);

describe('APP_ERROR_CODE', () => {
  it('pins the error taxonomy every AppError must carry', () => {
    expect(APP_ERROR_CODE).toEqual({
      NetworkOffline: 'NETWORK_OFFLINE',
      Timeout: 'TIMEOUT',
      Unauthorized: 'UNAUTHORIZED',
      Forbidden: 'FORBIDDEN',
      NotFound: 'NOT_FOUND',
      RateLimited: 'RATE_LIMITED',
      Validation: 'VALIDATION_ERROR',
      Server: 'SERVER_ERROR',
      Unexpected: 'UNEXPECTED_ERROR',
      InvalidCredentials: 'INVALID_CREDENTIALS',
      SessionExpired: 'SESSION_EXPIRED',
      DeepLinkRejected: 'DEEP_LINK_REJECTED',
      LinkInvalidOrExpired: 'LINK_INVALID_OR_EXPIRED',
    });
  });

  it('keeps every code unique', () => {
    expect(new Set(VALUES).size).toBe(VALUES.length);
  });

  it('uses screaming-snake-case wire values', () => {
    expect(VALUES.filter((value) => value !== value.toUpperCase() || value.includes(' '))).toEqual(
      [],
    );
  });
});
