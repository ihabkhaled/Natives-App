import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PERMISSIONS } from '@/shared/security';

import { useNewsContext } from './use-news-context.hook';

const doubles = vi.hoisted(() => ({
  permissions: [] as readonly string[],
  isLoading: false,
  isOnline: true,
}));

vi.mock('@/modules/auth', () => ({
  useEffectivePermissions: () => ({
    permissions: doubles.permissions,
    isLoading: doubles.isLoading,
  }),
}));
vi.mock('@/platform', () => ({ useNetworkStatus: () => ({ isOnline: doubles.isOnline }) }));

describe('useNewsContext', () => {
  it('reads a signed-out visitor as permitted to read but not to write', () => {
    doubles.permissions = [];

    expect(renderHook(() => useNewsContext()).result.current.canManage).toBe(false);
  });

  it('recognises the newsroom grant', () => {
    doubles.permissions = [PERMISSIONS.newsManage];

    expect(renderHook(() => useNewsContext()).result.current.canManage).toBe(true);
  });

  it('inverts connectivity into the flag the screens read', () => {
    doubles.isOnline = false;

    expect(renderHook(() => useNewsContext()).result.current.isOffline).toBe(true);
    doubles.isOnline = true;
  });

  it('waits while the effective grants are still resolving', () => {
    doubles.isLoading = true;

    expect(renderHook(() => useNewsContext()).result.current.isLoading).toBe(true);
    doubles.isLoading = false;
  });
});
