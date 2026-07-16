import { afterEach, describe, expect, it } from 'vitest';

import { getAppQueryClient, resetAppQueryClientForTesting } from './query-client.factory';

afterEach(() => {
  resetAppQueryClientForTesting();
});

describe('getAppQueryClient', () => {
  it('returns a query client', () => {
    expect(getAppQueryClient().getQueryCache()).toBeDefined();
  });

  it('hands every caller the same instance', () => {
    expect(getAppQueryClient()).toBe(getAppQueryClient());
  });

  it('keeps cached data across calls, proving a single shared cache', () => {
    getAppQueryClient().setQueryData(['probe'], 'cached');

    expect(getAppQueryClient().getQueryData(['probe'])).toBe('cached');
  });

  it('applies the app-wide query defaults', () => {
    const defaults = getAppQueryClient().getDefaultOptions();

    expect(defaults.queries?.staleTime).toBe(30_000);
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
    expect(defaults.mutations?.retry).toBe(false);
  });
});

describe('resetAppQueryClientForTesting', () => {
  it('drops the singleton so the next caller builds a fresh client', () => {
    const first = getAppQueryClient();

    resetAppQueryClientForTesting();

    expect(getAppQueryClient()).not.toBe(first);
  });

  it('discards the previous cache with the previous client', () => {
    getAppQueryClient().setQueryData(['probe'], 'cached');

    resetAppQueryClientForTesting();

    expect(getAppQueryClient().getQueryData(['probe'])).toBeUndefined();
  });
});
