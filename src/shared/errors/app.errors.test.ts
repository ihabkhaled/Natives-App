import { describe, expect, it } from 'vitest';

import { AppError } from './app.errors';
import { APP_ERROR_CODE } from './error-codes.constants';

describe('AppError', () => {
  it('falls back to the code when no developer message is given', () => {
    const error = new AppError({ code: APP_ERROR_CODE.Timeout });

    expect(error.message).toBe(APP_ERROR_CODE.Timeout);
    expect(error.code).toBe(APP_ERROR_CODE.Timeout);
  });

  it('keeps the developer message when one is given', () => {
    const error = new AppError({ code: APP_ERROR_CODE.Server, message: 'upstream exploded' });

    expect(error.message).toBe('upstream exploded');
  });

  it('defaults field errors to an empty list and the request id to undefined', () => {
    const error = new AppError({ code: APP_ERROR_CODE.Unexpected });

    expect(error.fieldErrors).toEqual([]);
    expect(error.requestId).toBeUndefined();
  });

  it('carries the request id and field errors used by form and support surfaces', () => {
    const fieldErrors = [{ field: 'email', code: 'INVALID_EMAIL' }];
    const error = new AppError({
      code: APP_ERROR_CODE.Validation,
      requestId: 'req-42',
      fieldErrors,
    });

    expect(error.requestId).toBe('req-42');
    expect(error.fieldErrors).toEqual(fieldErrors);
  });

  it('preserves the cause for diagnostics', () => {
    const cause = new Error('socket hang up');
    const error = new AppError({ code: APP_ERROR_CODE.NetworkOffline, cause });

    expect(error.cause).toBe(cause);
  });

  it('behaves like a named Error subclass', () => {
    const error = new AppError({ code: APP_ERROR_CODE.Forbidden });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.name).toBe('AppError');
    expect(error.stack).toBeDefined();
  });
});
