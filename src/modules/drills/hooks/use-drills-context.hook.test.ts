import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { PERMISSIONS } from '@/shared/security';

import { useDrillsContext } from './use-drills-context.hook';

vi.mock('@/modules/auth', () => ({
  useActiveTeamScope: vi.fn(),
  useEffectivePermissions: vi.fn(),
}));
vi.mock('@/platform', () => ({ useNetworkStatus: vi.fn() }));

describe('useDrillsContext', () => {
  it('grants canManage only with drill.manage', () => {
    vi.mocked(useActiveTeamScope).mockReturnValue({ teamId: 't1', isLoading: false } as never);
    vi.mocked(useEffectivePermissions).mockReturnValue({
      permissions: [PERMISSIONS.drillManage],
      isLoading: false,
    } as never);
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

    const { result } = renderHook(() => useDrillsContext());

    expect(result.current).toEqual({
      teamId: 't1',
      isOffline: false,
      isLoading: false,
      canManage: true,
    });
  });

  it('withholds canManage from a principal without the grant', () => {
    vi.mocked(useActiveTeamScope).mockReturnValue({ teamId: 't1', isLoading: false } as never);
    vi.mocked(useEffectivePermissions).mockReturnValue({
      permissions: [],
      isLoading: false,
    } as never);
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

    expect(renderHook(() => useDrillsContext()).result.current.canManage).toBe(false);
  });

  it('reports loading while either the scope or the permissions are resolving', () => {
    vi.mocked(useActiveTeamScope).mockReturnValue({ teamId: '', isLoading: true } as never);
    vi.mocked(useEffectivePermissions).mockReturnValue({
      permissions: [],
      isLoading: false,
    } as never);
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

    expect(renderHook(() => useDrillsContext()).result.current.isLoading).toBe(true);
  });

  it('reports offline from the network status', () => {
    vi.mocked(useActiveTeamScope).mockReturnValue({ teamId: 't1', isLoading: false } as never);
    vi.mocked(useEffectivePermissions).mockReturnValue({
      permissions: [],
      isLoading: false,
    } as never);
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });

    expect(renderHook(() => useDrillsContext()).result.current.isOffline).toBe(true);
  });
});
