import { Capacitor } from '@capacitor/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hideSplashScreen } from '@/packages/capacitor-splash-screen';
import { applyStatusBarAppearance } from '@/packages/capacitor-status-bar';

import { applyNativeChrome } from './native-chrome.facade';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn(), getPlatform: vi.fn(() => 'web') },
}));
vi.mock('@/packages/capacitor-splash-screen', () => ({ hideSplashScreen: vi.fn() }));
vi.mock('@/packages/capacitor-status-bar', () => ({
  applyStatusBarAppearance: vi.fn(),
  STATUS_BAR_APPEARANCE: { Light: 'light', Dark: 'dark' },
}));

const isNativePlatformMock = vi.mocked(Capacitor.isNativePlatform);
const applyStatusBarAppearanceMock = vi.mocked(applyStatusBarAppearance);
const hideSplashScreenMock = vi.mocked(hideSplashScreen);

beforeEach(() => {
  vi.clearAllMocks();
  applyStatusBarAppearanceMock.mockResolvedValue(undefined);
  hideSplashScreenMock.mockResolvedValue(undefined);
});

describe('applyNativeChrome', () => {
  it('matches the status bar to the dark theme and hides the splash screen on native', async () => {
    isNativePlatformMock.mockReturnValue(true);

    await applyNativeChrome({ isDarkTheme: true });

    expect(applyStatusBarAppearanceMock).toHaveBeenCalledExactlyOnceWith('dark');
    expect(hideSplashScreenMock).toHaveBeenCalledOnce();
  });

  it('matches the status bar to the light theme on native', async () => {
    isNativePlatformMock.mockReturnValue(true);

    await applyNativeChrome({ isDarkTheme: false });

    expect(applyStatusBarAppearanceMock).toHaveBeenCalledExactlyOnceWith('light');
    expect(hideSplashScreenMock).toHaveBeenCalledOnce();
  });

  it('is a no-op on the web runtime', async () => {
    isNativePlatformMock.mockReturnValue(false);

    await applyNativeChrome({ isDarkTheme: true });

    expect(applyStatusBarAppearanceMock).not.toHaveBeenCalled();
    expect(hideSplashScreenMock).not.toHaveBeenCalled();
  });

  it('styles the status bar before hiding the splash screen', async () => {
    isNativePlatformMock.mockReturnValue(true);
    const order: string[] = [];
    applyStatusBarAppearanceMock.mockImplementation(() => {
      order.push('status-bar');
      return Promise.resolve();
    });
    hideSplashScreenMock.mockImplementation(() => {
      order.push('splash');
      return Promise.resolve();
    });

    await applyNativeChrome({ isDarkTheme: false });

    expect(order).toEqual(['status-bar', 'splash']);
  });
});
