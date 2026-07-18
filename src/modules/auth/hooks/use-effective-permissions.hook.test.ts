import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildAuthUser } from '../factories/auth.factory';
import { useCurrentUserQuery } from './use-current-user-query.hook';
import { useEffectivePermissions } from './use-effective-permissions.hook';
import { useSession } from './use-session.hook';

vi.mock('./use-session.hook', () => ({ useSession: vi.fn() }));
vi.mock('./use-current-user-query.hook', () => ({ useCurrentUserQuery: vi.fn() }));

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

    expect(result.current.permissions).toContain('users.manage');
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
