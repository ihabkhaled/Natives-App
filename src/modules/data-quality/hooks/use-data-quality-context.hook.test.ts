import { renderHook } from '@testing-library/react';
// Must be imported before `@/platform`, whose module factory below reads it.
import { createPlatformMock } from '../../../../tests/setup/platform-mock.helper';
import { describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { PERMISSIONS } from '@/shared/security';

import { useDataQualityContext } from './use-data-quality-context.hook';

vi.mock('@/platform', () => createPlatformMock());
vi.mock('@/modules/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthModule>();
  return { ...actual, useActiveTeamScope: vi.fn(), useEffectivePermissions: vi.fn() };
});

function arrange(permissions: readonly string[], isOnline = true, isLoading = false): void {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline });
  vi.mocked(useActiveTeamScope).mockReturnValue({
    teamId: 'team-1',
    membershipId: 'm1',
    seasonId: null,
    teamName: 'Cairo Natives',
    isLoading,
    isError: false,
  });
  vi.mocked(useEffectivePermissions).mockReturnValue({
    permissions,
    accountActive: true,
    accountPending: false,
    onboardingComplete: true,
    hasTeamContext: true,
    isLoading: false,
    isError: false,
  });
}

describe('useDataQualityContext', () => {
  it('grants the queue to a principal holding data_quality.manage', () => {
    arrange([PERMISSIONS.dataQualityManage]);

    expect(renderHook(() => useDataQualityContext()).result.current).toMatchObject({
      teamId: 'team-1',
      canManage: true,
      isOffline: false,
    });
  });

  it('refuses it to a principal without the grant', () => {
    arrange([]);

    expect(renderHook(() => useDataQualityContext()).result.current.canManage).toBe(false);
  });

  it('reports offline from the platform network status', () => {
    arrange([PERMISSIONS.dataQualityManage], false);

    expect(renderHook(() => useDataQualityContext()).result.current.isOffline).toBe(true);
  });

  it('stays loading while the team scope resolves', () => {
    arrange([PERMISSIONS.dataQualityManage], true, true);

    expect(renderHook(() => useDataQualityContext()).result.current.isLoading).toBe(true);
  });
});
