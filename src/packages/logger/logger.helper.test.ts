import { describe, expect, it } from 'vitest';

import { formatLogMessage, sanitizeLogFields } from './logger.helper';

describe('sanitizeLogFields', () => {
  it('keeps non-sensitive fields untouched', () => {
    const fields = { userId: 'u-1', attempt: 2, ok: true, payload: { nested: 'value' } };

    expect(sanitizeLogFields(fields)).toEqual(fields);
  });

  it('redacts every sensitive field name', () => {
    const sanitized = sanitizeLogFields({
      token: 'access-1',
      refreshToken: 'refresh-1',
      password: 'hunter2',
      clientSecret: 'shhh',
      authorization: 'Bearer x',
      cookie: 'sid=1',
      credential: 'c',
    });

    expect(sanitized).toEqual({
      token: '[REDACTED]',
      refreshToken: '[REDACTED]',
      password: '[REDACTED]',
      clientSecret: '[REDACTED]',
      authorization: '[REDACTED]',
      cookie: '[REDACTED]',
      credential: '[REDACTED]',
    });
  });

  it('matches sensitive field names case-insensitively', () => {
    expect(sanitizeLogFields({ Authorization: 'Bearer x', PASSWORD: 'p', Token: 't' })).toEqual({
      Authorization: '[REDACTED]',
      PASSWORD: '[REDACTED]',
      Token: '[REDACTED]',
    });
  });

  it('never mutates the caller fields', () => {
    const fields = { password: 'hunter2' };

    sanitizeLogFields(fields);

    expect(fields.password).toBe('hunter2');
  });

  it('handles an empty field map', () => {
    expect(sanitizeLogFields({})).toEqual({});
  });
});

describe('formatLogMessage', () => {
  it('prefixes the message with its scope', () => {
    expect(formatLogMessage('http', 'request failed')).toBe('[http] request failed');
  });

  it('formats an empty message', () => {
    expect(formatLogMessage('auth', '')).toBe('[auth] ');
  });
});
