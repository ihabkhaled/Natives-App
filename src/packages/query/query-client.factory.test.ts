import { describe, expect, it } from 'vitest';

import { HTTP_ERROR_KIND, HttpError } from '@/packages/http';

import { createAppQueryClient } from './query-client.factory';

function getRetryPredicate(): (failureCount: number, error: Error) => boolean {
  const retry = createAppQueryClient().getDefaultOptions().queries?.retry;
  if (typeof retry !== 'function') {
    throw new TypeError('expected the query retry default to be a predicate');
  }
  return retry;
}

function buildError(status: number): Error {
  return Object.assign(new Error(`HTTP ${String(status)}`), { status });
}

/** The AppError shape feature services throw: an Error whose cause is the HttpError. */
function wrappedHttpError(
  kind: (typeof HTTP_ERROR_KIND)[keyof typeof HTTP_ERROR_KIND],
  status?: number,
): Error {
  return new Error('request failed', { cause: new HttpError({ kind, status }) });
}

describe('createAppQueryClient', () => {
  it('applies the shared query defaults', () => {
    const defaults = createAppQueryClient().getDefaultOptions();

    expect(defaults.queries?.staleTime).toBe(30_000);
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
  });

  it('never retries mutations', () => {
    expect(createAppQueryClient().getDefaultOptions().mutations?.retry).toBe(false);
  });

  it('builds an independent client per call', () => {
    expect(createAppQueryClient()).not.toBe(createAppQueryClient());
  });
});

describe('the query retry predicate', () => {
  it('does not retry client errors', () => {
    const retry = getRetryPredicate();

    expect(retry(0, buildError(400))).toBe(false);
    expect(retry(0, buildError(401))).toBe(false);
    expect(retry(0, buildError(403))).toBe(false);
    expect(retry(0, buildError(404))).toBe(false);
    expect(retry(0, buildError(409))).toBe(false);
    expect(retry(0, buildError(422))).toBe(false);
    expect(retry(0, buildError(499))).toBe(false);
  });

  it('never retries the deterministic failures feature services throw', () => {
    const retry = getRetryPredicate();

    expect(retry(0, wrappedHttpError(HTTP_ERROR_KIND.Unauthorized, 401))).toBe(false);
    expect(retry(0, wrappedHttpError(HTTP_ERROR_KIND.Forbidden, 403))).toBe(false);
    expect(retry(0, wrappedHttpError(HTTP_ERROR_KIND.NotFound, 404))).toBe(false);
    expect(retry(0, wrappedHttpError(HTTP_ERROR_KIND.Validation, 422))).toBe(false);
  });

  it('retries the transient failures feature services throw', () => {
    const retry = getRetryPredicate();

    expect(retry(0, wrappedHttpError(HTTP_ERROR_KIND.Network))).toBe(true);
    expect(retry(0, wrappedHttpError(HTTP_ERROR_KIND.Timeout))).toBe(true);
    expect(retry(1, wrappedHttpError(HTTP_ERROR_KIND.Server, 502))).toBe(true);
    expect(retry(0, wrappedHttpError(HTTP_ERROR_KIND.RateLimited, 429))).toBe(true);
  });

  it('retries server errors and retry-worthy statuses while attempts remain', () => {
    const retry = getRetryPredicate();

    expect(retry(0, buildError(500))).toBe(true);
    expect(retry(1, buildError(503))).toBe(true);
    expect(retry(0, buildError(408))).toBe(true);
    expect(retry(0, buildError(429))).toBe(true);
  });

  it('never retries an error that carries no transient signal', () => {
    const retry = getRetryPredicate();

    expect(retry(0, new Error('no status'))).toBe(false);
    expect(retry(0, buildError(399))).toBe(false);
    expect(retry(0, Object.assign(new Error('odd'), { status: '404' }))).toBe(false);
  });

  it('stops once the attempt budget is spent', () => {
    const retry = getRetryPredicate();

    expect(retry(2, buildError(500))).toBe(false);
    expect(retry(5, wrappedHttpError(HTTP_ERROR_KIND.Network))).toBe(false);
  });
});
