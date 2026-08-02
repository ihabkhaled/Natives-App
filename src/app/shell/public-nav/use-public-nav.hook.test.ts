import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useSession } from '@/modules/auth';
import type * as SettingsModule from '@/modules/settings';
import { useLocaleToggle, useThemeToggle } from '@/modules/settings';
import { APP_PATHS } from '@/shared/config';

import { buildSessionView } from '../../../../tests/factories/session-view.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { usePublicNav } from './use-public-nav.hook';

vi.mock('@/modules/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  useSession: vi.fn(),
}));

vi.mock('@/modules/settings', async (importOriginal) => ({
  ...(await importOriginal<typeof SettingsModule>()),
  useThemeToggle: vi.fn(),
  useLocaleToggle: vi.fn(),
}));

const toggleTheme = vi.fn();
const toggleLocale = vi.fn();
const pushSpy = vi.fn();
let currentPath: string = APP_PATHS.root;

vi.mock('@/packages/router', () => ({
  useAppNavigation: () => ({
    push: pushSpy,
    replace: vi.fn(),
    goBack: vi.fn(),
    get currentPath() {
      return currentPath;
    },
  }),
}));

function mockSession(isResolved: boolean, isAuthenticated: boolean): void {
  vi.mocked(useSession).mockReturnValue(buildSessionView({ isResolved, isAuthenticated }));
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  currentPath = APP_PATHS.root;
  mockSession(true, false);
  vi.mocked(useThemeToggle).mockReturnValue({ isDark: false, toggle: toggleTheme });
  vi.mocked(useLocaleToggle).mockReturnValue({
    locale: 'en',
    isArabic: false,
    toggle: toggleLocale,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePublicNav', () => {
  it('stays hidden while the session is still resolving', () => {
    mockSession(false, false);

    expect(renderHook(() => usePublicNav()).result.current.isVisible).toBe(false);
  });

  it('stays hidden once a session is authenticated', () => {
    mockSession(true, true);

    expect(renderHook(() => usePublicNav()).result.current.isVisible).toBe(false);
  });

  it('shows for a resolved, anonymous session', () => {
    expect(renderHook(() => usePublicNav()).result.current.isVisible).toBe(true);
  });

  it('marks the routed destination active', () => {
    currentPath = APP_PATHS.about;
    const { result } = renderHook(() => usePublicNav());

    expect(result.current.links.find((link) => link.key === 'about')?.isActive).toBe(true);
    expect(result.current.links.find((link) => link.key === 'home')?.isActive).toBe(false);
  });

  it('labels the theme and locale switches with the state they move to', () => {
    expect(renderHook(() => usePublicNav()).result.current.themeToggleLabel).toBe(
      'Switch to dark theme',
    );
    expect(renderHook(() => usePublicNav()).result.current.localeToggleLabel).toBe(
      'View in Arabic',
    );

    vi.mocked(useThemeToggle).mockReturnValue({ isDark: true, toggle: toggleTheme });
    vi.mocked(useLocaleToggle).mockReturnValue({
      locale: 'ar',
      isArabic: true,
      toggle: toggleLocale,
    });
    expect(renderHook(() => usePublicNav()).result.current.themeToggleLabel).toBe(
      'Switch to light theme',
    );
    expect(renderHook(() => usePublicNav()).result.current.localeToggleLabel).toBe(
      'View in English',
    );
  });

  it('delegates the theme and locale switches to the settings module', () => {
    const { result } = renderHook(() => usePublicNav());

    act(() => {
      result.current.onToggleTheme();
    });
    act(() => {
      result.current.onToggleLocale();
    });

    expect(toggleTheme).toHaveBeenCalledOnce();
    expect(toggleLocale).toHaveBeenCalledOnce();
  });

  it('opens and closes the mobile drawer', () => {
    const { result } = renderHook(() => usePublicNav());

    expect(result.current.isMenuOpen).toBe(false);
    act(() => {
      result.current.onToggleMenu();
    });
    expect(result.current.isMenuOpen).toBe(true);
    expect(result.current.menuToggleLabel).toBe('Close menu');
    act(() => {
      result.current.onToggleMenu();
    });
    expect(result.current.isMenuOpen).toBe(false);
  });

  it('navigating pushes the target path and closes the drawer', () => {
    const { result } = renderHook(() => usePublicNav());

    act(() => {
      result.current.onToggleMenu();
    });
    act(() => {
      result.current.onNavigate(APP_PATHS.about);
    });

    expect(pushSpy).toHaveBeenCalledExactlyOnceWith(APP_PATHS.about);
    expect(result.current.isMenuOpen).toBe(false);
  });

  it('routes the sign-in action to the login screen', () => {
    const { result } = renderHook(() => usePublicNav());

    act(() => {
      result.current.onSignIn();
    });

    expect(pushSpy).toHaveBeenCalledExactlyOnceWith(APP_PATHS.login);
  });
});
