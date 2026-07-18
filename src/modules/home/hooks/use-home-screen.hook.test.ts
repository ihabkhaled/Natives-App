import { renderHook } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import {
  buildAuthUser,
  useCurrentUserQuery,
  useLogoutMutation,
  type CurrentUserQueryView,
  type LogoutMutationView,
} from '@/modules/auth';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useHomeScreen } from './use-home-screen.hook';

vi.mock('@/modules/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  useCurrentUserQuery: vi.fn(),
  useLogoutMutation: vi.fn(),
}));

const logout = vi.fn();

function mockCurrentUser(overrides: Partial<CurrentUserQueryView> = {}): void {
  vi.mocked(useCurrentUserQuery).mockReturnValue({
    user: buildAuthUser({ displayName: 'Ranger Rick' }),
    isLoading: false,
    isError: false,
    ...overrides,
  });
}

function mockLogout(overrides: Partial<LogoutMutationView> = {}): void {
  vi.mocked(useLogoutMutation).mockReturnValue({ logout, isLoggingOut: false, ...overrides });
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  mockCurrentUser();
  mockLogout();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useHomeScreen', () => {
  it('exposes the static labels as translated English copy', () => {
    const { result } = renderHook(() => useHomeScreen());

    expect(result.current.title).toBe('Home');
    expect(result.current.loadingLabel).toBe('Loading…');
    expect(result.current.logoutLabel).toBe('Sign out');
    expect(result.current.manageSessionsLabel).toBe('Manage your devices');
    expect(result.current.practiceCalendarLabel).toBe('Open the practice calendar');
  });

  it('interpolates the display name into the greeting', () => {
    const { result } = renderHook(() => useHomeScreen());

    expect(result.current.greeting).toBe('Hello, Ranger Rick');
  });

  it('greets with an empty name while the profile is still loading', () => {
    mockCurrentUser({ user: undefined, isLoading: true });

    const { result } = renderHook(() => useHomeScreen());

    expect(result.current.isLoadingUser).toBe(true);
    expect(result.current.greeting).toBe('Hello, ');
  });

  it('greets with an empty name when the profile failed to load', () => {
    mockCurrentUser({ user: undefined, isError: true });

    const { result } = renderHook(() => useHomeScreen());

    expect(result.current.isLoadingUser).toBe(false);
    expect(result.current.greeting).toBe('Hello, ');
  });

  it('reports a resolved profile as no longer loading', () => {
    const { result } = renderHook(() => useHomeScreen());

    expect(result.current.isLoadingUser).toBe(false);
  });

  it('delegates sign-out to the logout mutation', () => {
    const { result } = renderHook(() => useHomeScreen());

    result.current.onLogout();

    expect(logout).toHaveBeenCalledOnce();
  });

  it('mirrors the in-flight logout flag', () => {
    mockLogout({ isLoggingOut: true });

    const { result } = renderHook(() => useHomeScreen());

    expect(result.current.isLoggingOut).toBe(true);
  });

  it('never exposes the raw profile, only the prepared greeting', () => {
    const { result } = renderHook(() => useHomeScreen());

    expect(result.current).not.toHaveProperty('user');
    expect(Object.keys(result.current).sort()).toEqual([
      'greeting',
      'isLoadingUser',
      'isLoggingOut',
      'loadingLabel',
      'logoutLabel',
      'manageSessionsLabel',
      'onLogout',
      'practiceCalendarLabel',
      'title',
    ]);
  });
});
