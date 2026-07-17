import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSecureValue, removeSecureValue, setSecureValue } from '@/packages/secure-storage';
import { STORAGE_KEYS } from '@/shared/config';

import { createAuthTokenRepository, getAuthTokenRepository } from './token.repository';

vi.mock('@/packages/secure-storage', async () => {
  const { createSecureStorageDouble } =
    await import('../../../../tests/setup/secure-storage-double.helper');
  return createSecureStorageDouble();
});

const TOKENS = { accessToken: 'access-1', refreshToken: 'refresh-1' };

beforeEach(async () => {
  await createAuthTokenRepository().clearTokens();
  vi.clearAllMocks();
});

describe('createAuthTokenRepository', () => {
  it('round-trips a token pair through secure storage', async () => {
    const repository = createAuthTokenRepository();

    await repository.setTokens(TOKENS);

    await expect(repository.getAccessToken()).resolves.toBe('access-1');
    await expect(repository.getRefreshToken()).resolves.toBe('refresh-1');
  });

  it('writes each token under its dedicated secure-storage key', async () => {
    await createAuthTokenRepository().setTokens(TOKENS);

    expect(setSecureValue).toHaveBeenCalledWith(STORAGE_KEYS.authAccessToken, 'access-1');
    expect(setSecureValue).toHaveBeenCalledWith(STORAGE_KEYS.authRefreshToken, 'refresh-1');
    expect(setSecureValue).toHaveBeenCalledTimes(2);
  });

  it('reads each token from its dedicated secure-storage key', async () => {
    const repository = createAuthTokenRepository();

    await repository.getAccessToken();
    await repository.getRefreshToken();

    expect(getSecureValue).toHaveBeenNthCalledWith(1, STORAGE_KEYS.authAccessToken);
    expect(getSecureValue).toHaveBeenNthCalledWith(2, STORAGE_KEYS.authRefreshToken);
  });

  it('reports missing tokens as null', async () => {
    const repository = createAuthTokenRepository();

    await expect(repository.getAccessToken()).resolves.toBeNull();
    await expect(repository.getRefreshToken()).resolves.toBeNull();
  });

  it('removes both tokens on clear', async () => {
    const repository = createAuthTokenRepository();
    await repository.setTokens(TOKENS);

    await repository.clearTokens();

    expect(removeSecureValue).toHaveBeenCalledWith(STORAGE_KEYS.authAccessToken);
    expect(removeSecureValue).toHaveBeenCalledWith(STORAGE_KEYS.authRefreshToken);
    await expect(repository.getAccessToken()).resolves.toBeNull();
    await expect(repository.getRefreshToken()).resolves.toBeNull();
  });

  it('builds an independent instance per call', () => {
    expect(createAuthTokenRepository()).not.toBe(createAuthTokenRepository());
  });
});

describe('getAuthTokenRepository', () => {
  it('memoizes a single shared instance', () => {
    expect(getAuthTokenRepository()).toBe(getAuthTokenRepository());
  });

  it('shares persisted tokens across resolutions of the shared instance', async () => {
    await getAuthTokenRepository().setTokens(TOKENS);

    await expect(getAuthTokenRepository().getAccessToken()).resolves.toBe('access-1');
  });
});
