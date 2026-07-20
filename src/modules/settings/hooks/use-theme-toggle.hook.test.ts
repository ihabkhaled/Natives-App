import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as PlatformModule from '@/platform';
import { getSystemPrefersDark } from '@/platform';
import { THEME_MODE } from '@/shared/enums';

import { useSettingsStore } from '../store/settings.store';
import { useThemeToggle } from './use-theme-toggle.hook';

vi.mock('@/platform', async (importOriginal) => ({
  ...(await importOriginal<typeof PlatformModule>()),
  getSystemPrefersDark: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSystemPrefersDark).mockReturnValue(false);
  act(() => {
    useSettingsStore.getState().setTheme(THEME_MODE.Light);
  });
});

describe('useThemeToggle', () => {
  it('reports the explicit dark preference', () => {
    act(() => {
      useSettingsStore.getState().setTheme(THEME_MODE.Dark);
    });

    expect(renderHook(() => useThemeToggle()).result.current.isDark).toBe(true);
  });

  it('resolves the system preference when no explicit palette is stored', () => {
    vi.mocked(getSystemPrefersDark).mockReturnValue(true);
    act(() => {
      useSettingsStore.getState().setTheme(THEME_MODE.System);
    });

    expect(renderHook(() => useThemeToggle()).result.current.isDark).toBe(true);
  });

  it('switches a light palette to explicit dark', () => {
    const { result } = renderHook(() => useThemeToggle());

    act(() => {
      result.current.toggle();
    });

    expect(useSettingsStore.getState().theme).toBe(THEME_MODE.Dark);
  });

  it('switches a dark palette to explicit light', () => {
    act(() => {
      useSettingsStore.getState().setTheme(THEME_MODE.Dark);
    });
    const { result } = renderHook(() => useThemeToggle());

    act(() => {
      result.current.toggle();
    });

    expect(useSettingsStore.getState().theme).toBe(THEME_MODE.Light);
  });

  it('moves away from a system-resolved dark palette on the first tap', () => {
    vi.mocked(getSystemPrefersDark).mockReturnValue(true);
    act(() => {
      useSettingsStore.getState().setTheme(THEME_MODE.System);
    });
    const { result } = renderHook(() => useThemeToggle());

    act(() => {
      result.current.toggle();
    });

    expect(useSettingsStore.getState().theme).toBe(THEME_MODE.Light);
  });
});
