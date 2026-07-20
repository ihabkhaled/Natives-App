import { renderHook } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { buildAuthUser, useCurrentUserQuery, type CurrentUserQueryView } from '@/modules/auth';
import { useAppNavigation } from '@/packages/router';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useHomeScreen } from './use-home-screen.hook';

vi.mock('@/modules/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  useCurrentUserQuery: vi.fn(),
}));
vi.mock('@/packages/router', () => ({ useAppNavigation: vi.fn() }));

const push = vi.fn();

function mockCurrentUser(overrides: Partial<CurrentUserQueryView> = {}): void {
  vi.mocked(useCurrentUserQuery).mockReturnValue({
    user: buildAuthUser({ displayName: 'Ranger Rick' }),
    isLoading: false,
    isError: false,
    ...overrides,
  });
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(useAppNavigation).mockReturnValue({
    push,
    replace: vi.fn(),
    goBack: vi.fn(),
    currentPath: '/home',
  });
  mockCurrentUser();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useHomeScreen', () => {
  it('exposes the static labels as translated English copy', () => {
    const { result } = renderHook(() => useHomeScreen());

    expect(result.current.title).toBe('Home');
    expect(result.current.loadingLabel).toBe('Loading…');
    expect(result.current.manageSessionsLabel).toBe('Manage your devices');
    expect(result.current.practiceCalendarLabel).toBe('Open the practice calendar');
  });

  it('interpolates the display name into the greeting', () => {
    const { result } = renderHook(() => useHomeScreen());

    expect(result.current.greeting).toBe('Hello, Ranger Rick');
    expect(result.current.userName).toBe('Ranger Rick');
    expect(result.current.avatarLabel).toBe('Your profile');
  });

  it('greets with an empty name while the profile is still loading', () => {
    mockCurrentUser({ user: undefined, isLoading: true });

    const { result } = renderHook(() => useHomeScreen());

    expect(result.current.isLoadingUser).toBe(true);
    expect(result.current.greeting).toBe('Hello, ');
    expect(result.current.userName).toBeNull();
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

  it('never owns sign-out: the shell chrome is its single home', () => {
    const { result } = renderHook(() => useHomeScreen());

    expect(result.current).not.toHaveProperty('onLogout');
    expect(result.current).not.toHaveProperty('logoutLabel');
  });

  it('navigates to device-session management', () => {
    const { result } = renderHook(() => useHomeScreen());

    result.current.onManageSessions();

    expect(push).toHaveBeenCalledExactlyOnceWith('/sessions');
  });

  it('navigates to the practice calendar', () => {
    const { result } = renderHook(() => useHomeScreen());

    result.current.onOpenPracticeCalendar();

    expect(push).toHaveBeenCalledExactlyOnceWith('/practices');
  });

  it('never exposes an in-flight logout flag', () => {
    const { result } = renderHook(() => useHomeScreen());

    expect(result.current).not.toHaveProperty('isLoggingOut');
  });

  it('never exposes the raw profile, only the prepared greeting', () => {
    const { result } = renderHook(() => useHomeScreen());

    expect(result.current).not.toHaveProperty('user');
    expect(Object.keys(result.current).sort()).toEqual([
      'avatarLabel',
      'greeting',
      'isLoadingUser',
      'loadingLabel',
      'manageSessionsLabel',
      'onManageSessions',
      'onOpenPracticeCalendar',
      'practiceCalendarLabel',
      'title',
      'userName',
    ]);
  });
});
