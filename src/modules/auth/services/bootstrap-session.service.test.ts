import { beforeEach, describe, expect, it, vi } from 'vitest';

import { removeSecureValue, setSecureValue } from '@/packages/secure-storage';
import { STORAGE_KEYS } from '@/shared/config';

import { useSessionStore } from '../store/session.store';
import { SESSION_STATUS } from '../types/auth.types';
import { bootstrapSessionFromStoredTokens } from './bootstrap-session.service';

vi.mock('@/packages/secure-storage', async () => {
  const { createSecureStorageDouble } =
    await import('../../../../tests/setup/secure-storage-double.helper');
  return createSecureStorageDouble();
});

beforeEach(async () => {
  await removeSecureValue(STORAGE_KEYS.authAccessToken);
  useSessionStore.setState({ status: SESSION_STATUS.Unknown });
});

describe('bootstrapSessionFromStoredTokens', () => {
  it('resolves to authenticated when an access token is stored', async () => {
    await setSecureValue(STORAGE_KEYS.authAccessToken, 'access-1');

    await bootstrapSessionFromStoredTokens();

    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Authenticated);
  });

  it('resolves to anonymous when no access token is stored', async () => {
    await bootstrapSessionFromStoredTokens();

    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Anonymous);
  });

  it('treats an empty stored token as anonymous', async () => {
    await setSecureValue(STORAGE_KEYS.authAccessToken, '');

    await bootstrapSessionFromStoredTokens();

    expect(useSessionStore.getState().status).toBe(SESSION_STATUS.Anonymous);
  });

  it('always resolves the unknown status, whichever way it lands', async () => {
    await bootstrapSessionFromStoredTokens();
    expect(useSessionStore.getState().status).not.toBe(SESSION_STATUS.Unknown);

    await setSecureValue(STORAGE_KEYS.authAccessToken, 'access-1');
    await bootstrapSessionFromStoredTokens();
    expect(useSessionStore.getState().status).not.toBe(SESSION_STATUS.Unknown);
  });
});
