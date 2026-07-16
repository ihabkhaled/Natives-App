import { describe, expect, it } from 'vitest';

import { isSensitiveKey, REDACTED_PLACEHOLDER, redactSensitiveEntries } from './redact.helper';

describe('isSensitiveKey', () => {
  it.each([
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'client_secret',
    'password',
    'newPassword',
    'authorization',
    'Authorization',
    'cookie',
    'Set-Cookie',
    'credential',
    'awsCredentials',
    'TOKEN',
  ])('flags %s as sensitive', (key) => {
    expect(isSensitiveKey(key)).toBe(true);
  });

  it.each(['email', 'requestId', 'status', 'userName', 'retryCount', ''])(
    'leaves %s alone',
    (key) => {
      expect(isSensitiveKey(key)).toBe(false);
    },
  );

  it('matches anywhere in the key, not just at its start', () => {
    expect(isSensitiveKey('X-Authorization-Header')).toBe(true);
    expect(isSensitiveKey('emailAddress')).toBe(false);
  });
});

describe('redactSensitiveEntries', () => {
  it('replaces only the sensitive values in a mixed object', () => {
    const redacted = redactSensitiveEntries({
      requestId: 'req-1',
      accessToken: 'header.payload.signature',
      status: 401,
      Authorization: 'Bearer abc',
      nested: { password: 'still-visible' },
    });

    expect(redacted).toEqual({
      requestId: 'req-1',
      accessToken: REDACTED_PLACEHOLDER,
      status: 401,
      Authorization: REDACTED_PLACEHOLDER,
      nested: { password: 'still-visible' },
    });
  });

  it('returns a new object and keeps the input untouched', () => {
    const input = { password: 'hunter2' };

    const redacted = redactSensitiveEntries(input);

    expect(redacted).not.toBe(input);
    expect(input.password).toBe('hunter2');
  });

  it('handles an empty object', () => {
    expect(redactSensitiveEntries({})).toEqual({});
  });

  it('exposes the placeholder written to logs', () => {
    expect(REDACTED_PLACEHOLDER).toBe('[REDACTED]');
  });
});
