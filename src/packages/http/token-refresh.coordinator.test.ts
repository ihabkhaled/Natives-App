import { describe, expect, it, vi } from 'vitest';

import { buildTokenPair, createMemoryTokenStore } from '../../../tests/factories/http.factory';
import { TokenRefreshCoordinator } from './token-refresh.coordinator';

describe('TokenRefreshCoordinator', () => {
  it('refreshes once and stores the new pair', async () => {
    const tokenStore = createMemoryTokenStore(buildTokenPair());
    const refreshExecutor = vi.fn().mockResolvedValue(buildTokenPair({ accessToken: 'access-2' }));
    const coordinator = new TokenRefreshCoordinator({ tokenStore, refreshExecutor });

    await expect(coordinator.getFreshAccessToken()).resolves.toBe('access-2');
    expect(refreshExecutor).toHaveBeenCalledExactlyOnceWith('refresh-1');
    expect(tokenStore.snapshot()?.accessToken).toBe('access-2');
  });

  it('joins concurrent callers into a single flight', async () => {
    const tokenStore = createMemoryTokenStore(buildTokenPair());
    let resolveRefresh: (pair: ReturnType<typeof buildTokenPair>) => void = () => undefined;
    const refreshPromise = new Promise<ReturnType<typeof buildTokenPair>>((resolve) => {
      resolveRefresh = resolve;
    });
    const refreshExecutor = vi.fn().mockReturnValue(refreshPromise);
    const coordinator = new TokenRefreshCoordinator({ tokenStore, refreshExecutor });

    const first = coordinator.getFreshAccessToken();
    const second = coordinator.getFreshAccessToken();
    await vi.waitFor(() => {
      expect(refreshExecutor).toHaveBeenCalledTimes(1);
    });
    resolveRefresh(buildTokenPair({ accessToken: 'access-shared' }));

    await expect(first).resolves.toBe('access-shared');
    await expect(second).resolves.toBe('access-shared');
    expect(refreshExecutor).toHaveBeenCalledTimes(1);
  });

  it('allows a fresh flight after the previous one settles', async () => {
    const tokenStore = createMemoryTokenStore(buildTokenPair());
    const refreshExecutor = vi
      .fn()
      .mockResolvedValueOnce(buildTokenPair({ accessToken: 'a2', refreshToken: 'r2' }))
      .mockResolvedValueOnce(buildTokenPair({ accessToken: 'a3', refreshToken: 'r3' }));
    const coordinator = new TokenRefreshCoordinator({ tokenStore, refreshExecutor });

    await expect(coordinator.getFreshAccessToken()).resolves.toBe('a2');
    await expect(coordinator.getFreshAccessToken()).resolves.toBe('a3');
    expect(refreshExecutor).toHaveBeenNthCalledWith(2, 'r2');
  });

  it('clears tokens and notifies on refresh failure', async () => {
    const tokenStore = createMemoryTokenStore(buildTokenPair());
    const onAuthFailure = vi.fn();
    const coordinator = new TokenRefreshCoordinator({
      tokenStore,
      refreshExecutor: vi.fn().mockRejectedValue(new Error('nope')),
      onAuthFailure,
    });

    await expect(coordinator.getFreshAccessToken()).resolves.toBeNull();
    expect(tokenStore.snapshot()).toBeNull();
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it('fails fast when no refresh token exists', async () => {
    const tokenStore = createMemoryTokenStore(null);
    const refreshExecutor = vi.fn();
    const onAuthFailure = vi.fn();
    const coordinator = new TokenRefreshCoordinator({ tokenStore, refreshExecutor, onAuthFailure });

    await expect(coordinator.getFreshAccessToken()).resolves.toBeNull();
    expect(refreshExecutor).not.toHaveBeenCalled();
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });
});
