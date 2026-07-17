import { describe, expect, it } from 'vitest';

import { isAppError, toAppError } from './app-error.helper';
import { AppError } from './app.errors';
import { APP_ERROR_CODE } from './error-codes.constants';

describe('isAppError', () => {
  it('accepts an AppError', () => {
    expect(isAppError(new AppError({ code: APP_ERROR_CODE.Timeout }))).toBe(true);
  });

  it('rejects a plain Error and non-error values', () => {
    expect(isAppError(new Error('boom'))).toBe(false);
    expect(isAppError('boom')).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });
});

describe('toAppError', () => {
  it('passes an existing AppError through untouched', () => {
    const original = new AppError({ code: APP_ERROR_CODE.SessionExpired, requestId: 'req-1' });

    expect(toAppError(original)).toBe(original);
  });

  it('wraps a plain Error with the default fallback code and keeps its message and cause', () => {
    const cause = new Error('socket hang up');

    const wrapped = toAppError(cause);

    expect(wrapped).toBeInstanceOf(AppError);
    expect(wrapped.code).toBe(APP_ERROR_CODE.Unexpected);
    expect(wrapped.message).toBe('socket hang up');
    expect(wrapped.cause).toBe(cause);
  });

  it('wraps a non-error value and falls back to the code as the message', () => {
    const wrapped = toAppError('kaboom');

    expect(wrapped.code).toBe(APP_ERROR_CODE.Unexpected);
    expect(wrapped.message).toBe(APP_ERROR_CODE.Unexpected);
    expect(wrapped.cause).toBe('kaboom');
    expect(wrapped.fieldErrors).toEqual([]);
  });

  it('honours a custom fallback code for a plain Error', () => {
    const wrapped = toAppError(new Error('nope'), APP_ERROR_CODE.InvalidCredentials);

    expect(wrapped.code).toBe(APP_ERROR_CODE.InvalidCredentials);
    expect(wrapped.message).toBe('nope');
  });

  it('honours a custom fallback code for a non-error value', () => {
    const wrapped = toAppError({ status: 500 }, APP_ERROR_CODE.Server);

    expect(wrapped.code).toBe(APP_ERROR_CODE.Server);
    expect(wrapped.message).toBe(APP_ERROR_CODE.Server);
  });
});
