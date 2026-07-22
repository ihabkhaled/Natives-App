import { describe, expect, it } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';

import { isTransientFailure } from './transient-failure.helper';

/** The AppError shape feature services throw: an Error carrying the HttpError as cause. */
function wrappedError(
  kind: (typeof HTTP_ERROR_KIND)[keyof typeof HTTP_ERROR_KIND],
  status?: number,
): Error {
  return new Error('wrapped', { cause: new HttpError({ kind, status }) });
}

describe('isTransientFailure', () => {
  it('treats network and timeout failures as transient', () => {
    expect(isTransientFailure(new HttpError({ kind: HTTP_ERROR_KIND.Network }))).toBe(true);
    expect(isTransientFailure(new HttpError({ kind: HTTP_ERROR_KIND.Timeout }))).toBe(true);
  });

  it('treats server errors and rate limits as transient', () => {
    expect(isTransientFailure(new HttpError({ kind: HTTP_ERROR_KIND.Server, status: 503 }))).toBe(
      true,
    );
    expect(
      isTransientFailure(new HttpError({ kind: HTTP_ERROR_KIND.RateLimited, status: 429 })),
    ).toBe(true);
  });

  it('never treats auth, permission, or missing-resource failures as transient', () => {
    expect(
      isTransientFailure(new HttpError({ kind: HTTP_ERROR_KIND.Unauthorized, status: 401 })),
    ).toBe(false);
    expect(
      isTransientFailure(new HttpError({ kind: HTTP_ERROR_KIND.Forbidden, status: 403 })),
    ).toBe(false);
    expect(isTransientFailure(new HttpError({ kind: HTTP_ERROR_KIND.NotFound, status: 404 }))).toBe(
      false,
    );
  });

  it('never treats validation, conflict, or contract failures as transient', () => {
    expect(
      isTransientFailure(new HttpError({ kind: HTTP_ERROR_KIND.Validation, status: 422 })),
    ).toBe(false);
    expect(isTransientFailure(new HttpError({ kind: HTTP_ERROR_KIND.Conflict, status: 409 }))).toBe(
      false,
    );
    expect(isTransientFailure(new HttpError({ kind: HTTP_ERROR_KIND.ResponseContract }))).toBe(
      false,
    );
    expect(isTransientFailure(new HttpError({ kind: HTTP_ERROR_KIND.Cancelled }))).toBe(false);
  });

  it('classifies an unexpected-kind failure by its transient status codes', () => {
    expect(
      isTransientFailure(new HttpError({ kind: HTTP_ERROR_KIND.Unexpected, status: 408 })),
    ).toBe(true);
    expect(
      isTransientFailure(new HttpError({ kind: HTTP_ERROR_KIND.Unexpected, status: 418 })),
    ).toBe(false);
    expect(isTransientFailure(new HttpError({ kind: HTTP_ERROR_KIND.Unexpected }))).toBe(false);
  });

  it('unwraps the HttpError an AppError carries as its cause', () => {
    expect(isTransientFailure(wrappedError(HTTP_ERROR_KIND.Network))).toBe(true);
    expect(isTransientFailure(wrappedError(HTTP_ERROR_KIND.Server, 500))).toBe(true);
    expect(isTransientFailure(wrappedError(HTTP_ERROR_KIND.Forbidden, 403))).toBe(false);
    expect(isTransientFailure(wrappedError(HTTP_ERROR_KIND.NotFound, 404))).toBe(false);
  });

  it('falls back to a bare numeric status for non-HttpError shapes', () => {
    expect(isTransientFailure(Object.assign(new Error('boom'), { status: 500 }))).toBe(true);
    expect(isTransientFailure(Object.assign(new Error('boom'), { status: 429 }))).toBe(true);
    expect(isTransientFailure(Object.assign(new Error('boom'), { status: 408 }))).toBe(true);
    expect(isTransientFailure(Object.assign(new Error('boom'), { status: 403 }))).toBe(false);
    expect(isTransientFailure(Object.assign(new Error('boom'), { status: 404 }))).toBe(false);
  });

  it('never retries an unrecognized failure: deterministic until proven otherwise', () => {
    expect(isTransientFailure(new Error('no status at all'))).toBe(false);
    expect(isTransientFailure(Object.assign(new Error('odd'), { status: '404' }))).toBe(false);
    expect(isTransientFailure(null)).toBe(false);
    expect(isTransientFailure(undefined)).toBe(false);
  });
});
