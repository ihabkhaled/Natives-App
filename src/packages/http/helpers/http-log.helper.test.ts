import { describe, expect, it } from 'vitest';

import { sanitizeHeadersForLog } from './http-log.helper';

describe('sanitizeHeadersForLog', () => {
  it('keeps safe headers readable', () => {
    const headers = { 'Content-Type': 'application/json', 'X-Request-Id': 'req-1' };

    expect(sanitizeHeadersForLog(headers)).toEqual(headers);
  });

  it('redacts credential-bearing headers', () => {
    expect(
      sanitizeHeadersForLog({
        Authorization: 'Bearer access-1',
        Cookie: 'sid=1',
        'Set-Cookie': 'sid=1',
        'X-Api-Key': 'key-1',
      }),
    ).toEqual({
      Authorization: '[REDACTED]',
      Cookie: '[REDACTED]',
      'Set-Cookie': '[REDACTED]',
      'X-Api-Key': '[REDACTED]',
    });
  });

  it('matches header names case-insensitively', () => {
    expect(sanitizeHeadersForLog({ authorization: 'Bearer access-1', COOKIE: 'sid=1' })).toEqual({
      authorization: '[REDACTED]',
      COOKIE: '[REDACTED]',
    });
  });

  it('only redacts exact header names, not lookalikes', () => {
    expect(
      sanitizeHeadersForLog({ 'X-Authorization-Scheme': 'bearer', 'Cookie-Policy': 'strict' }),
    ).toEqual({ 'X-Authorization-Scheme': 'bearer', 'Cookie-Policy': 'strict' });
  });

  it('never mutates the caller headers', () => {
    const headers = { Authorization: 'Bearer access-1' };

    sanitizeHeadersForLog(headers);

    expect(headers.Authorization).toBe('Bearer access-1');
  });

  it('handles an empty header map', () => {
    expect(sanitizeHeadersForLog({})).toEqual({});
  });
});
