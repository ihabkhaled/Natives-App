import { act } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import {
  buildAuthUser,
  useCurrentUserQuery,
  useEffectivePermissions,
  useLogoutMutation,
  useSession,
} from '@/modules/auth';
import type * as NotificationsModule from '@/modules/notifications';
import { useUnreadNotifications } from '@/modules/notifications';
import type * as SettingsModule from '@/modules/settings';
import { useThemeToggle } from '@/modules/settings';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useAppBar } from './use-app-bar.hook';

vi.mock('@/modules/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthModule>();
  return {
    ...actual,
    useSession: vi.fn(),
    useEffectivePermissions: vi.fn(),
    useCurrentUserQuery: vi.fn(),
    useLogoutMutation: vi.fn(),
  };
});

vi.mock('@/modules/notifications', async (importOriginal) => ({
  ...(await importOriginal<typeof NotificationsModule>()),
  useUnreadNotifications: vi.fn(),
}));

vi.mock('@/modules/settings', async (importOriginal) => ({
  ...(await importOriginal<typeof SettingsModule>()),
  useThemeToggle: vi.fn(),
}));

const logout = vi.fn();
const toggleTheme = vi.fn();

function mockSession(isAuthenticated: boolean): void {
  vi.mocked(useSession).mockReturnValue({
    status: isAuthenticated ? 'authenticated' : 'anonymous',
    isAuthenticated,
    isResolved: true,
  });
}

function mockEffective(isLoading = false): void {
  vi.mocked(useEffectivePermissions).mockReturnValue({
    permissions: [],
    accountActive: true,
    onboardingComplete: true,
    hasTeamContext: true,
    isLoading,
    isError: false,
  });
}

function renderAppBar(initialPath = '/home') {
  return renderHookWithProviders(() => useAppBar(), { initialPath });
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  mockSession(true);
  mockEffective();
  vi.mocked(useCurrentUserQuery).mockReturnValue({
    user: buildAuthUser({ displayName: 'Ranger Rick' }),
    isLoading: false,
    isError: false,
  });
  vi.mocked(useLogoutMutation).mockReturnValue({ logout, isLoggingOut: false });
  vi.mocked(useThemeToggle).mockReturnValue({ isDark: false, toggle: toggleTheme });
  vi.mocked(useUnreadNotifications).mockReturnValue({
    unreadCount: 0,
    isLoading: false,
    latest: [],
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useAppBar', () => {
  it('stays hidden for an anonymous session', () => {
    mockSession(false);

    expect(renderAppBar().result.current.isVisible).toBe(false);
  });

  it('stays hidden while the effective session is still loading', () => {
    mockEffective(true);

    expect(renderAppBar().result.current.isVisible).toBe(false);
  });

  it('titles the bar from the routed screen', () => {
    expect(renderAppBar('/home').result.current.title).toBe('Home');
    expect(renderAppBar('/settings').result.current.title).toBe('Settings');
  });

  it('falls back to the product name on an unrouted location', () => {
    expect(renderAppBar('/nowhere-at-all').result.current.title).toBe('Ultimate Natives');
  });

  it('labels the palette switch with the palette it moves to', () => {
    expect(renderAppBar().result.current.themeToggleLabel).toBe('Switch to dark theme');

    vi.mocked(useThemeToggle).mockReturnValue({ isDark: true, toggle: toggleTheme });
    expect(renderAppBar().result.current.themeToggleLabel).toBe('Switch to light theme');
  });

  it('delegates the palette switch to the settings module', () => {
    const { result } = renderAppBar();

    act(() => {
      result.current.onToggleTheme();
    });

    expect(toggleTheme).toHaveBeenCalledOnce();
  });

  it('opens one panel at a time and closes it on a second activation', () => {
    const { result } = renderAppBar();

    act(() => {
      result.current.onToggleNotifications();
    });
    expect(result.current.isNotificationsOpen).toBe(true);

    act(() => {
      result.current.onToggleUserMenu();
    });
    expect(result.current.isNotificationsOpen).toBe(false);
    expect(result.current.isUserMenuOpen).toBe(true);

    act(() => {
      result.current.onToggleUserMenu();
    });
    expect(result.current.isUserMenuOpen).toBe(false);
  });

  it('offers settings and sign-out in the account menu', () => {
    const { result } = renderAppBar();

    expect(result.current.userMenuItems.map((entry) => entry.label)).toEqual([
      'Settings',
      'Sign out',
    ]);
  });

  it('navigates to settings and closes the menu', () => {
    const { result } = renderAppBar();

    act(() => {
      result.current.onToggleUserMenu();
    });
    act(() => {
      result.current.userMenuItems[0]?.onSelect();
    });

    expect(result.current.isUserMenuOpen).toBe(false);
    expect(result.current.title).toBe('Settings');
  });

  it('signs out from the account menu', () => {
    const { result } = renderAppBar();

    act(() => {
      result.current.userMenuItems[1]?.onSelect();
    });

    expect(logout).toHaveBeenCalledOnce();
  });

  it('badges the unread count from the real inbox, and nothing when it is clear', () => {
    expect(renderAppBar().result.current.notificationsBadgeLabel).toBeNull();

    vi.mocked(useUnreadNotifications).mockReturnValue({
      unreadCount: 3,
      isLoading: false,
      latest: [],
    });
    const badged = renderAppBar();

    expect(badged.result.current.notificationsUnreadCount).toBe(3);
    expect(badged.result.current.notificationsBadgeLabel).toBe('3 unread');
  });

  it('previews the latest inbox rows without any target content', () => {
    vi.mocked(useUnreadNotifications).mockReturnValue({
      unreadCount: 1,
      isLoading: false,
      latest: [
        {
          id: 'ntf-1',
          title: 'Practice published',
          body: 'Open this notification to go to the related screen.',
          categoryLabel: 'Practice',
          categoryTone: 'primary',
          receivedLabel: 'Received: today',
          deliveryLabel: 'Delivered in app',
          deliveryTone: 'primary',
          readLabel: null,
          isUnread: true,
          openLabel: 'Open',
          canOpen: true,
          markReadLabel: 'Mark as read',
        },
      ],
    });

    expect(renderAppBar().result.current.notificationsLatest).toEqual([
      {
        id: 'ntf-1',
        title: 'Practice published',
        receivedLabel: 'Received: today',
        isUnread: true,
      },
    ]);
  });

  it('opens a notification through the arrival screen, never at the target', () => {
    const { result } = renderAppBar();

    act(() => {
      result.current.onToggleNotifications();
    });
    act(() => {
      result.current.onOpenNotification('ntf-1');
    });

    expect(result.current.isNotificationsOpen).toBe(false);
    expect(result.current.title).toBe('Opening notification');
  });

  it('routes to the inbox and to the preference screen from the popover', () => {
    const inbox = renderAppBar();
    act(() => {
      inbox.result.current.onViewAllNotifications();
    });
    expect(inbox.result.current.title).toBe('Notifications');

    const preferences = renderAppBar();
    act(() => {
      preferences.result.current.onOpenNotificationPreferences();
    });
    expect(preferences.result.current.title).toBe('Notification preferences');
  });

  it('exposes the signed-in display name for the avatar', () => {
    expect(renderAppBar().result.current.userName).toBe('Ranger Rick');
  });

  it('falls back to an empty name until the profile resolves', () => {
    vi.mocked(useCurrentUserQuery).mockReturnValue({
      user: undefined,
      isLoading: true,
      isError: false,
    });

    expect(renderAppBar().result.current.userName).toBe('');
  });
});
