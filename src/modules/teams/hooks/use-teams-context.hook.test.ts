import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { PERMISSIONS } from '@/shared/security';

import { useTeamsContext } from './use-teams-context.hook';

vi.mock('@/modules/auth', () => ({
  useActiveTeamScope: vi.fn(),
  useEffectivePermissions: vi.fn(),
}));
vi.mock('@/platform', () => ({ useNetworkStatus: vi.fn() }));

function mock(permissions: readonly string[], overrides: { isOnline?: boolean } = {}): void {
  vi.mocked(useActiveTeamScope).mockReturnValue({
    teamId: 'team-1',
    membershipId: 'membership-1',
    seasonId: null,
    teamName: 'Ultimate Natives',
    isLoading: false,
    isError: false,
  });
  vi.mocked(useEffectivePermissions).mockReturnValue({
    permissions,
    accountActive: true,
    onboardingComplete: true,
    hasTeamContext: true,
    isLoading: false,
    isError: false,
  });
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: overrides.isOnline ?? true });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useTeamsContext', () => {
  it('separates the platform capabilities from the team-scoped ones', () => {
    mock([PERMISSIONS.teamRead, PERMISSIONS.settingsManage, PERMISSIONS.seasonManage]);

    const { result } = renderHook(() => useTeamsContext());

    expect(result.current).toMatchObject({
      teamId: 'team-1',
      canReadTeams: true,
      canManageTeams: true,
      canManageSeasons: true,
      // A team administrator holds neither platform grant.
      canBrowseAllTeams: false,
      canCreateTeams: false,
      canReadRoleMatrix: false,
    });
  });

  it('grants the platform capabilities to a super administrator', () => {
    mock([PERMISSIONS.teamBrowseAll, PERMISSIONS.teamCreate, PERMISSIONS.memberRolesManage]);

    const { result } = renderHook(() => useTeamsContext());

    expect(result.current).toMatchObject({
      canBrowseAllTeams: true,
      canCreateTeams: true,
      canReadRoleMatrix: true,
    });
  });

  it('grants nothing to a principal with no permissions at all', () => {
    mock([]);

    const { result } = renderHook(() => useTeamsContext());

    expect(result.current).toMatchObject({
      canReadTeams: false,
      canManageTeams: false,
      canManageSeasons: false,
      canBrowseAllTeams: false,
      canCreateTeams: false,
      canReadRoleMatrix: false,
    });
  });

  it('reports offline so the screens can show their offline state', () => {
    mock([], { isOnline: false });

    const { result } = renderHook(() => useTeamsContext());

    expect(result.current.isOffline).toBe(true);
  });
});
