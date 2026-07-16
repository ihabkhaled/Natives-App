import { describe, expect, it } from 'vitest';

import { HTTP_ERROR_KIND } from '../constants/http-error-kind.constants';
import { HttpError, isHttpError } from './http.errors';

describe('HttpError', () => {
  it('falls back to the kind as its message', () => {
    const error = new HttpError({ kind: HTTP_ERROR_KIND.Network });

    expect(error.message).toBe(HTTP_ERROR_KIND.Network);
    expect(error.name).toBe('HttpError');
    expect(error).toBeInstanceOf(Error);
  });

  it('keeps an explicit message', () => {
    expect(new HttpError({ kind: HTTP_ERROR_KIND.Server, message: 'HTTP 500' }).message).toBe(
      'HTTP 500',
    );
  });

  it('defaults the optional details', () => {
    const error = new HttpError({ kind: HTTP_ERROR_KIND.Timeout });

    expect(error.status).toBeUndefined();
    expect(error.requestId).toBeUndefined();
    expect(error.fieldErrors).toEqual([]);
    expect(error.cause).toBeUndefined();
  });

  it('carries the full failure detail', () => {
    const cause = new Error('root cause');
    const error = new HttpError({
      kind: HTTP_ERROR_KIND.Validation,
      message: 'HTTP 400',
      status: 400,
      requestId: 'req-9',
      fieldErrors: [{ field: 'email', code: 'INVALID_EMAIL' }],
      cause,
    });

    expect(error.kind).toBe(HTTP_ERROR_KIND.Validation);
    expect(error.status).toBe(400);
    expect(error.requestId).toBe('req-9');
    expect(error.fieldErrors).toEqual([{ field: 'email', code: 'INVALID_EMAIL' }]);
    expect(error.cause).toBe(cause);
  });

  it('treats an explicitly undefined field error list as empty', () => {
    expect(
      new HttpError({ kind: HTTP_ERROR_KIND.Server, fieldErrors: undefined }).fieldErrors,
    ).toEqual([]);
  });
});

describe('isHttpError', () => {
  it('recognizes an HttpError', () => {
    expect(isHttpError(new HttpError({ kind: HTTP_ERROR_KIND.Network }))).toBe(true);
  });

  it('rejects other errors and values', () => {
    expect(isHttpError(new Error('plain'))).toBe(false);
    expect(isHttpError({ kind: HTTP_ERROR_KIND.Network })).toBe(false);
    expect(isHttpError(null)).toBe(false);
    expect(isHttpError(undefined)).toBe(false);
    expect(isHttpError('network')).toBe(false);
  });
});
