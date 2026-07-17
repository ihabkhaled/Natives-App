import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hideSplashScreen } from './capacitor-splash-screen.facade';

const { hide } = vi.hoisted(() => ({ hide: vi.fn<() => Promise<void>>() }));

vi.mock('@capacitor/splash-screen', () => ({ SplashScreen: { hide } }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('hideSplashScreen', () => {
  it('asks the plugin to hide the splash screen', async () => {
    await hideSplashScreen();

    expect(hide).toHaveBeenCalledTimes(1);
  });

  it('resolves quietly when the plugin is unavailable', async () => {
    hide.mockRejectedValue(new Error('not implemented on web'));

    await expect(hideSplashScreen()).resolves.toBeUndefined();
  });
});
