import { describe, expect, it } from 'vitest';

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
    expect(retry(0, buildError(404))).toBe(false);
    expect(retry(0, buildError(422))).toBe(false);
    expect(retry(0, buildError(499))).toBe(false);
  });

  it('retries server errors while attempts remain', () => {
    const retry = getRetryPredicate();

    expect(retry(0, buildError(500))).toBe(true);
    expect(retry(1, buildError(503))).toBe(true);
  });

  it('retries errors that carry no status', () => {
    const retry = getRetryPredicate();

    expect(retry(0, new Error('network down'))).toBe(true);
  });

  it('retries when the status is below the client-error range', () => {
    const retry = getRetryPredicate();

    expect(retry(0, buildError(399))).toBe(true);
  });

  it('stops once the attempt budget is spent', () => {
    const retry = getRetryPredicate();

    expect(retry(2, buildError(500))).toBe(false);
    expect(retry(5, new Error('network down'))).toBe(false);
  });

  it('ignores a non-numeric status', () => {
    const retry = getRetryPredicate();

    expect(retry(0, Object.assign(new Error('odd'), { status: '404' }))).toBe(true);
  });
});
