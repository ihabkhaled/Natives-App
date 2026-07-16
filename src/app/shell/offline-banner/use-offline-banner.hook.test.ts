import { renderHook } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import type * as PlatformModule from '@/platform';
import { useNetworkStatus } from '@/platform';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useOfflineBanner } from './use-offline-banner.hook';

vi.mock('@/platform', async (importOriginal) => ({
  ...(await importOriginal<typeof PlatformModule>()),
  useNetworkStatus: vi.fn(),
}));

beforeAll(async () => {
  await initTestI18n();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useOfflineBanner', () => {
  it('stays hidden while the connection is up', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

    const { result } = renderHook(() => useOfflineBanner());

    expect(result.current.visible).toBe(false);
  });

  it('appears when the connection drops', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });

    const { result } = renderHook(() => useOfflineBanner());

    expect(result.current.visible).toBe(true);
  });

  it('carries translated English copy', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });

    const { result } = renderHook(() => useOfflineBanner());

    expect(result.current.message).toBe('You are offline');
  });

  it('keeps the message ready even while hidden', () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

    const { result } = renderHook(() => useOfflineBanner());

    expect(result.current.message).toBe('You are offline');
  });
});
