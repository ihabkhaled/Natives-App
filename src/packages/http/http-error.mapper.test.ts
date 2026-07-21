import { AxiosError, AxiosHeaders, CanceledError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';

import { HTTP_ERROR_KIND } from './constants/http-error-kind.constants';
import { HttpError } from './errors/http.errors';
import { mapResponseToHttpError, mapUnknownToHttpError } from './http-error.mapper';

function buildAxiosError(options: {
  readonly code?: string;
  readonly status?: number;
  readonly data?: unknown;
}): AxiosError {
  const config = { headers: new AxiosHeaders() };
  const response: AxiosResponse | undefined =
    options.status === undefined
      ? undefined
      : {
          status: options.status,
          statusText: String(options.status),
          data: options.data,
          headers: {},
          config,
        };
  return new AxiosError('request failed', options.code, config, null, response);
}

describe('mapResponseToHttpError', () => {
  it.each([
    [401, HTTP_ERROR_KIND.Unauthorized],
    [403, HTTP_ERROR_KIND.Forbidden],
    [404, HTTP_ERROR_KIND.NotFound],
    [409, HTTP_ERROR_KIND.Conflict],
    [429, HTTP_ERROR_KIND.RateLimited],
    [400, HTTP_ERROR_KIND.Validation],
    [422, HTTP_ERROR_KIND.Validation],
    [500, HTTP_ERROR_KIND.Server],
    [503, HTTP_ERROR_KIND.Server],
    [418, HTTP_ERROR_KIND.Unexpected],
    [302, HTTP_ERROR_KIND.Unexpected],
  ])('maps status %i onto the %s kind', (status, kind) => {
    expect(mapResponseToHttpError(status, null)).toMatchObject({ kind, status });
  });

  it('falls back to a bare status message for an unreadable body', () => {
    const error = mapResponseToHttpError(500, 'gateway exploded');

    expect(error.message).toBe('HTTP 500');
    expect(error.requestId).toBeUndefined();
    expect(error.fieldErrors).toEqual([]);
  });

  it('reads the nest error envelope', () => {
    const error = mapResponseToHttpError(400, {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: [{ field: 'email', code: 'INVALID_EMAIL', message: 'bad' }],
      requestId: 'req-9',
    });

    expect(error.kind).toBe(HTTP_ERROR_KIND.Validation);
    expect(error.message).toBe('HTTP 400 (VALIDATION_ERROR)');
    expect(error.requestId).toBe('req-9');
    expect(error.fieldErrors).toEqual([{ field: 'email', code: 'INVALID_EMAIL' }]);
  });

  it('captures the backend messageKey and prefers it as the message detail', () => {
    const error = mapResponseToHttpError(409, {
      statusCode: 409,
      messageKey: 'errors.members.accountRequired',
    });

    expect(error.messageKey).toBe('errors.members.accountRequired');
    expect(error.message).toBe('HTTP 409 (errors.members.accountRequired)');
  });

  it('leaves the messageKey undefined when the envelope omits it', () => {
    expect(mapResponseToHttpError(500, { statusCode: 500 }).messageKey).toBeUndefined();
  });

  it('accepts a nest envelope without field errors', () => {
    const error = mapResponseToHttpError(403, { statusCode: 403, code: 'FORBIDDEN' });

    expect(error.fieldErrors).toEqual([]);
    expect(error.message).toBe('HTTP 403 (FORBIDDEN)');
  });

  it('accepts a nest envelope without a code', () => {
    const error = mapResponseToHttpError(500, { statusCode: 500 });

    expect(error.message).toBe('HTTP 500');
    expect(error.fieldErrors).toEqual([]);
  });

  it('reads an rfc 9457 problem-details body', () => {
    const error = mapResponseToHttpError(404, {
      type: 'https://example.com/not-found',
      title: 'Resource not found',
      status: 404,
      detail: 'No such thing',
    });

    expect(error.kind).toBe(HTTP_ERROR_KIND.NotFound);
    expect(error.message).toBe('HTTP 404 (Resource not found)');
    expect(error.requestId).toBeUndefined();
  });

  it('tolerates problem details without a title', () => {
    expect(mapResponseToHttpError(404, { status: 404 }).message).toBe('HTTP 404');
  });

  it('keeps the transport cause when one is given', () => {
    const cause = new Error('socket hang up');

    expect(mapResponseToHttpError(500, null, cause).cause).toBe(cause);
  });
});

describe('mapUnknownToHttpError', () => {
  it('passes an HttpError straight through', () => {
    const original = new HttpError({ kind: HTTP_ERROR_KIND.ResponseContract });

    expect(mapUnknownToHttpError(original)).toBe(original);
  });

  it('maps a cancellation', () => {
    const cancelled = new CanceledError();

    expect(mapUnknownToHttpError(cancelled)).toMatchObject({
      kind: HTTP_ERROR_KIND.Cancelled,
      cause: cancelled,
    });
  });

  it.each(['ECONNABORTED', 'ETIMEDOUT'])('maps the %s axios code onto a timeout', (code) => {
    expect(mapUnknownToHttpError(buildAxiosError({ code }))).toMatchObject({
      kind: HTTP_ERROR_KIND.Timeout,
    });
  });

  it('maps a response-less axios error onto a network failure', () => {
    expect(mapUnknownToHttpError(buildAxiosError({ code: 'ERR_NETWORK' }))).toMatchObject({
      kind: HTTP_ERROR_KIND.Network,
    });
  });

  it('maps an axios error without a code onto a network failure', () => {
    expect(mapUnknownToHttpError(buildAxiosError({}))).toMatchObject({
      kind: HTTP_ERROR_KIND.Network,
    });
  });

  it('maps an axios response error through the status mapper', () => {
    const axiosError = buildAxiosError({
      status: 422,
      data: { statusCode: 422, code: 'VALIDATION_ERROR', requestId: 'req-1' },
    });

    expect(mapUnknownToHttpError(axiosError)).toMatchObject({
      kind: HTTP_ERROR_KIND.Validation,
      status: 422,
      requestId: 'req-1',
      cause: axiosError,
    });
  });

  it('maps anything else onto an unexpected failure', () => {
    const thrown = new TypeError('undefined is not a function');

    expect(mapUnknownToHttpError(thrown)).toMatchObject({
      kind: HTTP_ERROR_KIND.Unexpected,
      cause: thrown,
    });
  });

  it('maps a non-error throwable onto an unexpected failure', () => {
    expect(mapUnknownToHttpError('boom')).toMatchObject({
      kind: HTTP_ERROR_KIND.Unexpected,
      cause: 'boom',
    });
  });

  it('always returns an HttpError instance', () => {
    expect(mapUnknownToHttpError(undefined)).toBeInstanceOf(HttpError);
  });
});
