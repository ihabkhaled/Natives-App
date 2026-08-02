import { describe, expect, it } from 'vitest';

import { APP_ERROR_CODE, AppError, type AppFieldError } from '@/shared/errors';

import { resolveRejectedContactFields } from './contact-field-errors.helper';

function validationError(fieldErrors: readonly AppFieldError[]): AppError {
  return new AppError({ code: APP_ERROR_CODE.Validation, fieldErrors });
}

describe('resolveRejectedContactFields', () => {
  it('returns nothing when the submit did not fail', () => {
    expect(resolveRejectedContactFields(null)).toEqual([]);
  });

  it('returns nothing for a failure that is not a rejected body', () => {
    const error = new AppError({
      code: APP_ERROR_CODE.RateLimited,
      fieldErrors: [{ field: 'email', code: 'INVALID_EMAIL' }],
    });

    expect(resolveRejectedContactFields(error)).toEqual([]);
  });

  it('names every form field the backend rejected', () => {
    const error = validationError([
      { field: 'email', code: 'INVALID_EMAIL' },
      { field: 'message', code: 'LENGTH_OUT_OF_RANGE' },
    ]);

    expect(resolveRejectedContactFields(error)).toEqual(['email', 'message']);
  });

  it('drops complaints about properties the visitor cannot see', () => {
    const error = validationError([
      { field: 'nickname', code: 'UNKNOWN_PROPERTY' },
      { field: 'subject', code: 'LENGTH_OUT_OF_RANGE' },
    ]);

    expect(resolveRejectedContactFields(error)).toEqual(['subject']);
  });

  it('returns nothing when a rejection names no field at all', () => {
    expect(resolveRejectedContactFields(validationError([]))).toEqual([]);
  });
});
