import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PERMISSIONS } from '@/shared/security';

import { buildAuthUser } from '../factories/auth.factory';
import { useActiveTeamScope } from './use-active-team-scope.hook';
import { useCurrentUserQuery } from './use-current-user-query.hook';
import { useScopedPermissionsQuery } from './use-scoped-permissions-query.hook';
import { useEffectivePermissions } from './use-effective-permissions.hook';
import { useSession } from './use-session.hook';

vi.mock('./use-session.hook', () => ({ useSession: vi.fn() }));
vi.mock('./use-current-user-query.hook', () => ({ useCurrentUserQuery: vi.fn() }));
vi.mock('./use-active-team-scope.hook', () => ({ useActiveTeamScope: vi.fn() }));
vi.mock('./use-scoped-permissions-query.hook', () => ({ useScopedPermissionsQuery: vi.fn() }));

function mockSession(isAuthenticated: boolean): void {
  vi.mocked(useSession).mockReturnValue({
    status: isAuthenticated ? 'authenticated' : 'anonymous',
    isAuthenticated,
    isResolved: true,
  });
}

function mockCurrentUser(view: Partial<ReturnType<typeof useCurrentUserQuery>>): void {
  vi.mocked(useCurrentUserQuery).mockReturnValue({
    user: undefined,
    isLoading: false,
    isError: false,
    ...view,
  });
}

function mockScope(teamId: string): void {
  vi.mocked(useActiveTeamScope).mockReturnValue({
    teamId,
    membershipId: teamId === '' ? '' : 'membership-1',
    seasonId: null,
    teamName: teamId === '' ? '' : 'Team One',
    isLoading: false,
    isError: false,
  });
}

function mockScoped(permissions: readonly string[], isLoading = false): void {
  vi.mocked(useScopedPermissionsQuery).mockReturnValue({ permissions, isLoading, isError: false });
}

beforeEach(() => {
  mockScope('');
  mockScoped([]);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useEffectivePermissions', () => {
  it('disables the profile fetch while anonymous and grants nothing', () => {
    mockSession(false);
    mockCurrentUser({ isLoading: true });

    const { result } = renderHook(() => useEffectivePermissions());

    expect(vi.mocked(useCurrentUserQuery)).toHaveBeenCalledWith({ enabled: false });
    expect(result.current).toEqual({
      permissions: [],
      accountActive: false,
      onboardingComplete: false,
      hasTeamContext: false,
      isLoading: false,
      isError: false,
    });
  });

  it('reports loading while the authenticated profile is still fetching', () => {
    mockSession(true);
    mockCurrentUser({ isLoading: true });

    const { result } = renderHook(() => useEffectivePermissions());

    expect(vi.mocked(useCurrentUserQuery)).toHaveBeenCalledWith({ enabled: true });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.permissions).toEqual([]);
    expect(result.current.hasTeamContext).toBe(false);
  });

  it('derives grants, account state, and team context from the loaded admin', () => {
    mockSession(true);
    mockCurrentUser({ user: buildAuthUser() });

    const { result } = renderHook(() => useEffectivePermissions());

    expect(result.current.permissions).toContain(PERMISSIONS.memberLifecycleManage);
    expect(result.current.accountActive).toBe(true);
    expect(result.current.onboardingComplete).toBe(true);
    expect(result.current.hasTeamContext).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('treats a suspended or team-less account as inactive scope', () => {
    mockSession(true);
    mockCurrentUser({
      user: buildAuthUser({
        accountState: 'suspended',
        memberships: [],
        onboardingComplete: false,
      }),
    });

    const { result } = renderHook(() => useEffectivePermissions());

    expect(result.current.accountActive).toBe(false);
    expect(result.current.onboardingComplete).toBe(false);
    expect(result.current.hasTeamContext).toBe(false);
  });

  it('surfaces the profile error branch for an authenticated session', () => {
    mockSession(true);
    mockCurrentUser({ isError: true });

    const { result } = renderHook(() => useEffectivePermissions());

    expect(result.current.isError).toBe(true);
  });
});

describe('useEffectivePermissions across scopes', () => {
  it('unions the global grants with the ones held only inside the active team', () => {
    mockSession(true);
    mockCurrentUser({ user: buildAuthUser({ permissions: ['team.read'] }) });
    mockScope('team-1');
    mockScoped(['member.list', 'season.manage']);

    const { result } = renderHook(() => useEffectivePermissions());

    expect(result.current.permissions).toEqual(['member.list', 'season.manage', 'team.read']);
  });

  it('keeps waiting while the team-scoped grants are still in flight', () => {
    mockSession(true);
    mockCurrentUser({ user: buildAuthUser({ permissions: ['team.read'] }) });
    mockScope('team-1');
    mockScoped([], true);

    const { result } = renderHook(() => useEffectivePermissions());

    // Deciding a guard here would forbid a screen this principal may see.
    expect(result.current.isLoading).toBe(true);
  });

  it('asks for the grants of whichever team the principal switched to', () => {
    mockSession(true);
    mockCurrentUser({ user: buildAuthUser() });
    mockScope('team-2');
    mockScoped([]);

    renderHook(() => useEffectivePermissions());

    expect(vi.mocked(useScopedPermissionsQuery)).toHaveBeenCalledWith('team-2', true);
  });

  it('falls back to the global grants for a principal with no team at all', () => {
    mockSession(true);
    mockCurrentUser({ user: buildAuthUser({ permissions: ['team.read'], memberships: [] }) });

    const { result } = renderHook(() => useEffectivePermissions());

    expect(result.current.permissions).toEqual(['team.read']);
    expect(result.current.hasTeamContext).toBe(false);
  });
});
