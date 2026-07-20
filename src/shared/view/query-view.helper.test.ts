import { describe, expect, it, vi } from 'vitest';

import { AppError } from '../errors/app.errors';
import { toRemoteQueryView } from './query-view.helper';

describe('toRemoteQueryView', () => {
  it('passes data and the pending flag through untouched', () => {
    const view = toRemoteQueryView({
      data: [1, 2],
      isPending: false,
      error: null,
      refetch: vi.fn(),
    });

    expect(view.data).toEqual([1, 2]);
    expect(view.isLoading).toBe(false);
    expect(view.error).toBeNull();
  });

  it('treats an undefined error as no error at all', () => {
    const view = toRemoteQueryView({
      data: undefined,
      isPending: true,
      error: undefined,
      refetch: vi.fn(),
    });

    expect(view.error).toBeNull();
    expect(view.isLoading).toBe(true);
  });

  it('normalizes a raw failure into an AppError', () => {
    const view = toRemoteQueryView({
      data: undefined,
      isPending: false,
      error: new Error('boom'),
      refetch: vi.fn(),
    });

    expect(view.error).toBeInstanceOf(AppError);
  });

  it('exposes a void-returning refetch that drives the underlying one', () => {
    const refetch = vi.fn();

    toRemoteQueryView({ data: 1, isPending: false, error: null, refetch }).refetch();

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
