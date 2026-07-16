import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { changeAppLocale, getActiveLocale } from '@/packages/i18n';
import type * as PlatformModule from '@/platform';
import { getDeviceInformation, getExecutionContext, useNetworkStatus } from '@/platform';
import { API_MODE, APP_LOCALE, THEME_MODE } from '@/shared/enums';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useSettingsStore } from '../store/settings.store';
import { useSettingsScreen } from './use-settings-screen.hook';

vi.mock('@/platform', async (importOriginal) => ({
  ...(await importOriginal<typeof PlatformModule>()),
  getDeviceInformation: vi.fn(),
  getExecutionContext: vi.fn(),
  useNetworkStatus: vi.fn(),
}));

function mockPlatform(
  options: {
    readonly isOnline?: boolean;
    readonly apiMode?: 'mock' | 'remote';
    readonly isNative?: boolean;
    readonly platform?: 'web' | 'ios' | 'android';
  } = {},
): void {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: options.isOnline ?? true });
  vi.mocked(getExecutionContext).mockReturnValue({
    apiMode: options.apiMode ?? API_MODE.Mock,
    isDevelopment: true,
    isProduction: false,
  });
  vi.mocked(getDeviceInformation).mockResolvedValue({
    platform: options.platform ?? 'web',
    model: 'Chrome',
    osVersion: '140.0',
    isNative: options.isNative ?? false,
  });
}

/** Render and wait for the async device lookup to land. */
async function renderResolvedSettings(): Promise<
  ReturnType<typeof renderHook<ReturnType<typeof useSettingsScreen>, unknown>>
> {
  const view = renderHook(() => useSettingsScreen());
  await waitFor(() => {
    expect(view.result.current.platformText).not.toBe('');
  });
  return view;
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState({ theme: THEME_MODE.System, locale: APP_LOCALE.English });
  mockPlatform();
});

afterEach(async () => {
  vi.clearAllMocks();
  await changeAppLocale(APP_LOCALE.English);
});

describe('useSettingsScreen', () => {
  it('exposes the section labels as translated English copy', () => {
    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current.title).toBe('Settings');
    expect(result.current.appearanceLabel).toBe('Appearance');
    expect(result.current.connectivityLabel).toBe('Connectivity');
    expect(result.current.runtimeLabel).toBe('Runtime');
    expect(result.current.apiModeLabel).toBe('API mode');
    expect(result.current.platformLabel).toBe('Platform');
  });

  it('offers every theme with a translated label', () => {
    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current.themeLabel).toBe('Theme');
    expect(result.current.themeChoices).toEqual([
      { value: THEME_MODE.Light, label: 'Light' },
      { value: THEME_MODE.Dark, label: 'Dark' },
      { value: THEME_MODE.System, label: 'System' },
    ]);
  });

  it('offers every locale with a label written in its own language', () => {
    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current.languageLabel).toBe('Language');
    expect(result.current.localeChoices).toEqual([
      { value: APP_LOCALE.English, label: 'English' },
      { value: APP_LOCALE.Arabic, label: 'العربية' },
    ]);
  });

  it('mirrors the persisted preferences', () => {
    useSettingsStore.setState({ theme: THEME_MODE.Dark, locale: APP_LOCALE.Arabic });

    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current.theme).toBe(THEME_MODE.Dark);
    expect(result.current.locale).toBe(APP_LOCALE.Arabic);
  });

  it('writes a theme change straight to the settings store', () => {
    const { result } = renderHook(() => useSettingsScreen());

    act(() => {
      result.current.onThemeChange(THEME_MODE.Dark);
    });

    expect(useSettingsStore.getState().theme).toBe(THEME_MODE.Dark);
    expect(result.current.theme).toBe(THEME_MODE.Dark);
  });

  it('persists a locale change and switches the live translation language', async () => {
    const { result } = renderHook(() => useSettingsScreen());

    act(() => {
      result.current.onLocaleChange(APP_LOCALE.Arabic);
    });

    expect(useSettingsStore.getState().locale).toBe(APP_LOCALE.Arabic);
    await waitFor(() => {
      expect(getActiveLocale()).toBe(APP_LOCALE.Arabic);
    });
  });

  it('re-translates its own labels after the locale changes', async () => {
    const { result } = renderHook(() => useSettingsScreen());

    act(() => {
      result.current.onLocaleChange(APP_LOCALE.Arabic);
    });

    await waitFor(() => {
      expect(result.current.title).toBe('الإعدادات');
    });
  });

  it('reports an online connection', () => {
    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.networkStatusText).toBe('Online');
  });

  it('reports a lost connection', () => {
    mockPlatform({ isOnline: false });

    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current.isOnline).toBe(false);
    expect(result.current.networkStatusText).toBe('Offline');
  });

  it('names the mock API mode', () => {
    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current.apiModeText).toBe('Mock (MSW)');
  });

  it('names the remote API mode', () => {
    mockPlatform({ apiMode: API_MODE.Remote });

    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current.apiModeText).toBe('Remote (NestJS)');
  });

  it('leaves the platform blank until the device lookup resolves', () => {
    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current.platformText).toBe('');
  });

  it('describes a web runtime once the device lookup resolves', async () => {
    const { result } = await renderResolvedSettings();

    expect(result.current.platformText).toBe('web · Web');
  });

  it('describes a native runtime once the device lookup resolves', async () => {
    mockPlatform({ isNative: true, platform: 'ios' });

    const { result } = await renderResolvedSettings();

    expect(result.current.platformText).toBe('ios · Native');
  });
});
