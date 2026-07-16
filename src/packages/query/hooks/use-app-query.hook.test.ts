import { describe, expect, it, vi } from 'vitest';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

import { useAppQuery } from './use-app-query.hook';

describe('useAppQuery', () => {
  it('resolves data through the query provider', async () => {
    const queryFn = vi.fn(() => Promise.resolve({ id: 'h-1' }));
    const { result } = renderHookWithProviders(() =>
      useAppQuery({ queryKey: ['health'], queryFn }),
    );

    expect(result.current.status).toBe('pending');

    await vi.waitFor(() => {
      expect(result.current.status).toBe('success');
    });
    expect(result.current.data).toEqual({ id: 'h-1' });
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('surfaces the rejection as an error state', async () => {
    const failure = new Error('boom');
    const { result } = renderHookWithProviders(() =>
      useAppQuery<{ id: string }, Error>({
        queryKey: ['health', 'failing'],
        queryFn: () => Promise.reject(failure),
      }),
    );

    await vi.waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.error).toBe(failure);
    expect(result.current.data).toBeUndefined();
  });

  it('honors the disabled option', () => {
    const queryFn = vi.fn(() => Promise.resolve('never'));
    const { result } = renderHookWithProviders(() =>
      useAppQuery({ queryKey: ['health', 'disabled'], queryFn, enabled: false }),
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(queryFn).not.toHaveBeenCalled();
  });
});
