import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { trackEvent } from '@/packages/analytics';
import { resetAppHttpClientForTesting, type TestRoute } from '@/packages/http';
import { getSecureValue, setSecureValue } from '@/packages/secure-storage';
import { STORAGE_KEYS } from '@/shared/config';

import { installTestAppHttpClient } from '../../../../tests/factories/http.factory';
import { AUTH_ANALYTICS_EVENTS } from '../constants/auth-analytics.constants';
import { AUTH_API_PATHS } from '../constants/auth-api.constants';
import { logoutUser } from './logout.service';

vi.mock('@/packages/analytics', () => ({ trackEvent: vi.fn() }));

vi.mock('@/packages/secure-storage', async () => {
  const { createSecureStorageDouble } =
    await import('../../../../tests/setup/secure-storage-double.helper');
  return createSecureStorageDouble();
});

function logoutRoute(status: number, data: unknown): TestRoute {
  return { method: 'POST', url: AUTH_API_PATHS.logout, respond: () => ({ status, data }) };
}

beforeEach(async () => {
  await setSecureValue(STORAGE_KEYS.authAccessToken, 'access-1');
  await setSecureValue(STORAGE_KEYS.authRefreshToken, 'refresh-1');
  vi.clearAllMocks();
});

afterEach(() => {
  resetAppHttpClientForTesting();
});

describe('logoutUser', () => {
  it('clears the stored tokens after the server acknowledges', async () => {
    installTestAppHttpClient([logoutRoute(200, { success: true })]);

    await logoutUser();

    await expect(getSecureValue(STORAGE_KEYS.authAccessToken)).resolves.toBeNull();
    await expect(getSecureValue(STORAGE_KEYS.authRefreshToken)).resolves.toBeNull();
  });

  it('still clears the stored tokens when the server logout fails', async () => {
    installTestAppHttpClient([logoutRoute(500, { statusCode: 500 })]);

    await expect(logoutUser()).resolves.toBeUndefined();

    await expect(getSecureValue(STORAGE_KEYS.authAccessToken)).resolves.toBeNull();
    await expect(getSecureValue(STORAGE_KEYS.authRefreshToken)).resolves.toBeNull();
  });

  it('still clears the stored tokens when the transport is unavailable', async () => {
    await expect(logoutUser()).resolves.toBeUndefined();

    await expect(getSecureValue(STORAGE_KEYS.authAccessToken)).resolves.toBeNull();
    await expect(getSecureValue(STORAGE_KEYS.authRefreshToken)).resolves.toBeNull();
  });

  it('tracks the logout-completed event on the happy path', async () => {
    installTestAppHttpClient([logoutRoute(200, { success: true })]);

    await logoutUser();

    expect(trackEvent).toHaveBeenCalledExactlyOnceWith(AUTH_ANALYTICS_EVENTS.logoutCompleted);
  });

  it('tracks the logout-completed event even when the server call fails', async () => {
    installTestAppHttpClient([logoutRoute(500, { statusCode: 500 })]);

    await logoutUser();

    expect(trackEvent).toHaveBeenCalledExactlyOnceWith(AUTH_ANALYTICS_EVENTS.logoutCompleted);
  });
});
