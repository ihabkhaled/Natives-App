import { act } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import {
  buildAuthUser,
  useCurrentUserQuery,
  useEffectivePermissions,
  useSession,
  type CurrentUserQueryView,
} from '@/modules/auth';
import { PERMISSIONS } from '@/shared/security';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { usePrimaryNavigation } from './use-primary-navigation.hook';

vi.mock('@/modules/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  useSession: vi.fn(),
  useEffectivePermissions: vi.fn(),
  useCurrentUserQuery: vi.fn(),
}));

function mockCurrentUser(overrides: Partial<CurrentUserQueryView> = {}): void {
  vi.mocked(useCurrentUserQuery).mockReturnValue({
    user: buildAuthUser({ displayName: 'Ranger Rick' }),
    isLoading: false,
    isError: false,
    ...overrides,
  });
}

function mockSession(isAuthenticated: boolean): void {
  vi.mocked(useSession).mockReturnValue({
    status: isAuthenticated ? 'authenticated' : 'anonymous',
    isAuthenticated,
    isResolved: true,
  });
}

function mockEffective(overrides: Partial<ReturnType<typeof useEffectivePermissions>> = {}): void {
  vi.mocked(useEffectivePermissions).mockReturnValue({
    permissions: [],
    accountActive: true,
    onboardingComplete: true,
    hasTeamContext: true,
    isLoading: false,
    isError: false,
    ...overrides,
  });
}

function keysAt(path: string): readonly string[] {
  return renderHookWithProviders(() => usePrimaryNavigation(), {
    initialPath: path,
  }).result.current.items.map((item) => item.key);
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  mockCurrentUser();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePrimaryNavigation', () => {
  it('stays hidden for an anonymous session', () => {
    mockSession(false);
    mockEffective();

    const { result } = renderHookWithProviders(() => usePrimaryNavigation(), {
      initialPath: '/home',
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('stays hidden while the authenticated profile is still loading', () => {
    mockSession(true);
    mockEffective({ isLoading: true });

    const { result } = renderHookWithProviders(() => usePrimaryNavigation(), {
      initialPath: '/home',
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('shows the admin destination only for a manage-users session', () => {
    mockSession(true);
    mockEffective({ permissions: [PERMISSIONS.usersManage] });

    expect(keysAt('/home')).toEqual(['home', 'admin', 'settings']);
  });

  it('hides the admin destination from a member session', () => {
    mockSession(true);
    mockEffective({ permissions: [PERMISSIONS.membersRead] });

    expect(keysAt('/home')).toEqual(['home', 'settings']);
  });

  it('marks the active destination and follows a selection', () => {
    mockSession(true);
    mockEffective({ permissions: [PERMISSIONS.usersManage] });

    const { result } = renderHookWithProviders(() => usePrimaryNavigation(), {
      initialPath: '/settings',
    });
    expect(result.current.items.find((item) => item.key === 'settings')?.isActive).toBe(true);
    expect(result.current.items.find((item) => item.key === 'home')?.isActive).toBe(false);

    const home = result.current.items.find((item) => item.key === 'home');
    act(() => {
      home?.onSelect();
    });

    expect(result.current.items.find((item) => item.key === 'home')?.isActive).toBe(true);
  });

  it('exposes a translated accessible label for the navigation region', () => {
    mockSession(true);
    mockEffective({ permissions: [PERMISSIONS.usersManage] });

    const { result } = renderHookWithProviders(() => usePrimaryNavigation(), {
      initialPath: '/home',
    });

    expect(result.current.ariaLabel).toBe('Primary');
    expect(result.current.appName).toBe('Ultimate Natives');
    expect(result.current.logoLabel).toBe('Ultimate Natives logo');
  });

  it('exposes the signed-in profile for the sidebar block', () => {
    mockSession(true);
    mockEffective({ permissions: [PERMISSIONS.usersManage] });

    const { result } = renderHookWithProviders(() => usePrimaryNavigation(), {
      initialPath: '/home',
    });

    expect(result.current.profile).toEqual({ name: 'Ranger Rick', label: 'Your profile' });
  });

  it('omits the profile until the display name resolves', () => {
    mockSession(true);
    mockEffective({ permissions: [PERMISSIONS.usersManage] });
    mockCurrentUser({ user: undefined });

    const { result } = renderHookWithProviders(() => usePrimaryNavigation(), {
      initialPath: '/home',
    });

    expect(result.current.profile).toBeNull();
  });
});
