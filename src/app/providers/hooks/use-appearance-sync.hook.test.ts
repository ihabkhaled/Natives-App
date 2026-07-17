import { act, renderHook } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as SettingsModule from '@/modules/settings';
import { useAppearancePreferences } from '@/modules/settings';
import type * as I18nPackage from '@/packages/i18n';
import { changeAppLocale, getActiveLocale } from '@/packages/i18n';
import type * as PlatformModule from '@/platform';
import {
  applyDocumentLocale,
  applyDocumentTheme,
  applyNativeChrome,
  getSystemPrefersDark,
  subscribeToSystemTheme,
} from '@/platform';
import { APP_LOCALE, THEME_MODE, type AppLocale, type ThemeMode } from '@/shared/enums';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useAppearanceSync } from './use-appearance-sync.hook';

vi.mock('@/platform', async (importOriginal) => ({
  ...(await importOriginal<typeof PlatformModule>()),
  applyDocumentLocale: vi.fn(),
  applyDocumentTheme: vi.fn(),
  applyNativeChrome: vi.fn(),
  getSystemPrefersDark: vi.fn(),
  subscribeToSystemTheme: vi.fn(),
}));

// selectIsDarkTheme stays real: the resolution policy is what we assert.
vi.mock('@/modules/settings', async (importOriginal) => ({
  ...(await importOriginal<typeof SettingsModule>()),
  useAppearancePreferences: vi.fn(),
}));

vi.mock('@/packages/i18n', async (importOriginal) => ({
  ...(await importOriginal<typeof I18nPackage>()),
  changeAppLocale: vi.fn(),
}));

const unsubscribeSystemTheme = vi.fn();

function mockPreferences(theme: ThemeMode, locale: AppLocale = APP_LOCALE.English): void {
  vi.mocked(useAppearancePreferences).mockReturnValue({ theme, locale });
}

/** Hand back the listener the hook registered with the system theme owner. */
function systemThemeListener(): (prefersDark: boolean) => void {
  return vi.mocked(subscribeToSystemTheme).mock.calls[0]![0];
}

beforeAll(async () => {
  await initTestI18n();
});

// Cleared here, not in afterEach: the global testing-library cleanup unmounts
// after this file's afterEach hooks, so unmount cleanups would leak forward.
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSystemPrefersDark).mockReturnValue(false);
  vi.mocked(subscribeToSystemTheme).mockReturnValue(unsubscribeSystemTheme);
  vi.mocked(applyNativeChrome).mockResolvedValue();
  vi.mocked(changeAppLocale).mockResolvedValue();
  mockPreferences(THEME_MODE.System);
});

describe('useAppearanceSync', () => {
  it('applies the dark palette when the user picked dark', () => {
    mockPreferences(THEME_MODE.Dark);

    renderHook(() => {
      useAppearanceSync();
    });

    expect(applyDocumentTheme).toHaveBeenCalledWith(true);
    expect(applyNativeChrome).toHaveBeenCalledWith({ isDarkTheme: true });
  });

  it('applies the light palette when the user picked light, even if the system prefers dark', () => {
    vi.mocked(getSystemPrefersDark).mockReturnValue(true);
    mockPreferences(THEME_MODE.Light);

    renderHook(() => {
      useAppearanceSync();
    });

    expect(applyDocumentTheme).toHaveBeenCalledWith(false);
  });

  it('follows the system signal when the user picked system', () => {
    vi.mocked(getSystemPrefersDark).mockReturnValue(true);
    mockPreferences(THEME_MODE.System);

    renderHook(() => {
      useAppearanceSync();
    });

    expect(applyDocumentTheme).toHaveBeenCalledWith(true);
  });

  it('re-applies the theme when the system flips to dark while following it', () => {
    renderHook(() => {
      useAppearanceSync();
    });
    expect(applyDocumentTheme).toHaveBeenLastCalledWith(false);

    act(() => {
      systemThemeListener()(true);
    });

    expect(applyDocumentTheme).toHaveBeenLastCalledWith(true);
    expect(applyNativeChrome).toHaveBeenLastCalledWith({ isDarkTheme: true });
  });

  it('ignores a system flip when the user pinned a theme', () => {
    mockPreferences(THEME_MODE.Light);

    renderHook(() => {
      useAppearanceSync();
    });
    act(() => {
      systemThemeListener()(true);
    });

    expect(applyDocumentTheme).toHaveBeenCalledTimes(1);
    expect(applyDocumentTheme).toHaveBeenLastCalledWith(false);
  });

  it('applies the document locale and its writing direction', () => {
    renderHook(() => {
      useAppearanceSync();
    });

    expect(applyDocumentLocale).toHaveBeenCalledExactlyOnceWith(APP_LOCALE.English, 'ltr');
  });

  it('applies right-to-left for Arabic', () => {
    mockPreferences(THEME_MODE.System, APP_LOCALE.Arabic);

    renderHook(() => {
      useAppearanceSync();
    });

    expect(applyDocumentLocale).toHaveBeenCalledExactlyOnceWith(APP_LOCALE.Arabic, 'rtl');
  });

  it('switches the translation language when it drifts from the preference', () => {
    expect(getActiveLocale()).toBe(APP_LOCALE.English);
    mockPreferences(THEME_MODE.System, APP_LOCALE.Arabic);

    renderHook(() => {
      useAppearanceSync();
    });

    expect(changeAppLocale).toHaveBeenCalledExactlyOnceWith(APP_LOCALE.Arabic);
  });

  it('never reloads the translation language when it already matches', () => {
    renderHook(() => {
      useAppearanceSync();
    });

    expect(changeAppLocale).not.toHaveBeenCalled();
  });

  it('subscribes to the system theme exactly once', () => {
    const { rerender } = renderHook(() => {
      useAppearanceSync();
    });

    rerender();

    expect(subscribeToSystemTheme).toHaveBeenCalledOnce();
  });

  it('unsubscribes from the system theme on unmount', () => {
    const { unmount } = renderHook(() => {
      useAppearanceSync();
    });

    unmount();

    expect(unsubscribeSystemTheme).toHaveBeenCalledOnce();
  });
});
