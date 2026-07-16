import { describe, expect, it } from 'vitest';

import { HTTP_ERROR_KIND, HttpError, type HttpErrorKind } from '@/packages/http';
import { APP_ERROR_CODE, type AppErrorCode } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { mapHttpErrorToAppError } from './http-app-error.mapper';

const EXPECTED_CODE: Record<HttpErrorKind, AppErrorCode> = {
  [HTTP_ERROR_KIND.Network]: APP_ERROR_CODE.NetworkOffline,
  [HTTP_ERROR_KIND.Timeout]: APP_ERROR_CODE.Timeout,
  [HTTP_ERROR_KIND.Cancelled]: APP_ERROR_CODE.Unexpected,
  [HTTP_ERROR_KIND.Unauthorized]: APP_ERROR_CODE.Unauthorized,
  [HTTP_ERROR_KIND.Forbidden]: APP_ERROR_CODE.Forbidden,
  [HTTP_ERROR_KIND.NotFound]: APP_ERROR_CODE.NotFound,
  [HTTP_ERROR_KIND.RateLimited]: APP_ERROR_CODE.RateLimited,
  [HTTP_ERROR_KIND.Validation]: APP_ERROR_CODE.Validation,
  [HTTP_ERROR_KIND.Server]: APP_ERROR_CODE.Server,
  [HTTP_ERROR_KIND.ResponseContract]: APP_ERROR_CODE.Unexpected,
  [HTTP_ERROR_KIND.Unexpected]: APP_ERROR_CODE.Unexpected,
};

describe('mapHttpErrorToAppError', () => {
  it.each(Object.values(HTTP_ERROR_KIND))('maps the %s transport kind to its app code', (kind) => {
    const httpError = new HttpError({ kind, message: 'transport failed' });

    const appError = mapHttpErrorToAppError(httpError);

    expect(appError).toBeInstanceOf(AppError);
    expect(appError.code).toBe(EXPECTED_CODE[kind]);
    expect(appError.message).toBe('transport failed');
    expect(appError.cause).toBe(httpError);
  });

  it('carries the request id and field errors to the UI layer', () => {
    const fieldErrors = [{ field: 'email', code: 'INVALID_EMAIL' }];
    const httpError = new HttpError({
      kind: HTTP_ERROR_KIND.Validation,
      message: 'Validation failed',
      status: 400,
      requestId: 'req-9',
      fieldErrors,
    });

    const appError = mapHttpErrorToAppError(httpError);

    expect(appError.code).toBe(APP_ERROR_CODE.Validation);
    expect(appError.requestId).toBe('req-9');
    expect(appError.fieldErrors).toEqual(fieldErrors);
  });

  it('defaults the request id and field errors when the transport omits them', () => {
    const appError = mapHttpErrorToAppError(new HttpError({ kind: HTTP_ERROR_KIND.Server }));

    expect(appError.requestId).toBeUndefined();
    expect(appError.fieldErrors).toEqual([]);
    expect(appError.message).toBe(HTTP_ERROR_KIND.Server);
  });
});
