import { describe, expect, it } from 'vitest';

import { resolveAsyncViewStatus, type AsyncStatusInput } from './async-status.helper';

function input(overrides: Partial<AsyncStatusInput> = {}): AsyncStatusInput {
  return {
    isForbidden: false,
    isLoading: false,
    hasError: false,
    isOffline: false,
    hasData: true,
    hasItems: true,
    ...overrides,
  };
}

describe('resolveAsyncViewStatus', () => {
  it('presents forbidden ahead of every other state', () => {
    expect(
      resolveAsyncViewStatus(input({ isForbidden: true, isLoading: true, hasError: true })),
    ).toBe('forbidden');
  });

  it('presents loading while the request is still in flight', () => {
    expect(resolveAsyncViewStatus(input({ isLoading: true }))).toBe('loading');
  });

  it('presents offline only when there is nothing cached to show', () => {
    expect(resolveAsyncViewStatus(input({ isOffline: true, hasData: false }))).toBe('offline');
    expect(resolveAsyncViewStatus(input({ isOffline: true }))).toBe('ready');
  });

  it('presents error only when there is nothing cached to show', () => {
    expect(resolveAsyncViewStatus(input({ hasError: true, hasData: false }))).toBe('error');
    expect(resolveAsyncViewStatus(input({ hasError: true }))).toBe('ready');
  });

  it('keeps waiting when nothing has arrived and nothing has failed', () => {
    expect(resolveAsyncViewStatus(input({ hasData: false }))).toBe('loading');
  });

  it('separates a loaded-but-empty result from a loaded one', () => {
    expect(resolveAsyncViewStatus(input({ hasItems: false }))).toBe('empty');
    expect(resolveAsyncViewStatus(input())).toBe('ready');
  });
});
