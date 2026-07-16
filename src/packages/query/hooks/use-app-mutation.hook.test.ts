import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

import { useAppMutation } from './use-app-mutation.hook';

describe('useAppMutation', () => {
  it('runs the mutation and exposes the result', async () => {
    const mutationFn = vi.fn((email: string) => Promise.resolve(`token-for-${email}`));
    const { result } = renderHookWithProviders(() =>
      useAppMutation<string, string>({ mutationFn }),
    );

    expect(result.current.status).toBe('idle');

    act(() => {
      result.current.mutate('sam@example.com');
    });

    await vi.waitFor(() => {
      expect(result.current.status).toBe('success');
    });
    expect(result.current.data).toBe('token-for-sam@example.com');
    expect(mutationFn).toHaveBeenCalledTimes(1);
    expect(mutationFn.mock.calls[0]?.[0]).toBe('sam@example.com');
  });

  it('surfaces the rejection as an error state', async () => {
    const failure = new Error('invalid credentials');
    const { result } = renderHookWithProviders(() =>
      useAppMutation<string, string, Error>({ mutationFn: () => Promise.reject(failure) }),
    );

    act(() => {
      result.current.mutate('sam@example.com');
    });

    await vi.waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.error).toBe(failure);
  });

  it('forwards lifecycle callbacks', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useAppMutation<string, number>({
        mutationFn: (value: number) => Promise.resolve(`v${String(value)}`),
        onSuccess,
      }),
    );

    act(() => {
      result.current.mutate(7);
    });

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
    expect(onSuccess.mock.calls[0]?.[0]).toBe('v7');
  });
});
