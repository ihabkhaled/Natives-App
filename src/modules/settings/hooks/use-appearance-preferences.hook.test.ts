import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { APP_LOCALE, THEME_MODE } from '@/shared/enums';

import { useSettingsStore } from '../store/settings.store';
import { useAppearancePreferences } from './use-appearance-preferences.hook';

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState({ theme: THEME_MODE.System, locale: APP_LOCALE.English });
});

describe('useAppearancePreferences', () => {
  it('reads the current preferences out of the settings store', () => {
    const { result } = renderHook(() => useAppearancePreferences());

    expect(result.current).toEqual({ theme: THEME_MODE.System, locale: APP_LOCALE.English });
  });

  it('reflects preferences that were already set', () => {
    useSettingsStore.setState({ theme: THEME_MODE.Dark, locale: APP_LOCALE.Arabic });

    const { result } = renderHook(() => useAppearancePreferences());

    expect(result.current).toEqual({ theme: THEME_MODE.Dark, locale: APP_LOCALE.Arabic });
  });

  it('re-renders when the theme changes', () => {
    const { result } = renderHook(() => useAppearancePreferences());

    act(() => {
      useSettingsStore.getState().setTheme(THEME_MODE.Dark);
    });

    expect(result.current.theme).toBe(THEME_MODE.Dark);
  });

  it('re-renders when the locale changes', () => {
    const { result } = renderHook(() => useAppearancePreferences());

    act(() => {
      useSettingsStore.getState().setLocale(APP_LOCALE.Arabic);
    });

    expect(result.current.locale).toBe(APP_LOCALE.Arabic);
  });

  it('stays read-only: it never exposes the setters', () => {
    const { result } = renderHook(() => useAppearancePreferences());

    expect(Object.keys(result.current).sort()).toEqual(['locale', 'theme']);
  });
});
