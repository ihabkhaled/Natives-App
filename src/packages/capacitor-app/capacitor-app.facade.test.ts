import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  exitApp,
  getLaunchUrl,
  subscribeToAppStateChange,
  subscribeToAppUrlOpen,
  subscribeToHardwareBackButton,
} from './capacitor-app.facade';

const { addListener, readLaunchUrl, quitApp, remove } = vi.hoisted(() => ({
  addListener:
    vi.fn<
      (
        eventName: string,
        listener: (payload: unknown) => void,
      ) => Promise<{ remove: () => Promise<void> }>
    >(),
  readLaunchUrl: vi.fn<() => Promise<{ url: string } | undefined>>(),
  quitApp: vi.fn<() => Promise<void>>(),
  remove: vi.fn<() => Promise<void>>(),
}));

vi.mock('@capacitor/app', () => ({
  App: { addListener, getLaunchUrl: readLaunchUrl, exitApp: quitApp },
}));

function lastRegistration(): { eventName: string; listener: (payload: unknown) => void } {
  const call = addListener.mock.lastCall;
  if (call === undefined) {
    throw new Error('the facade never called App.addListener');
  }
  return { eventName: call[0], listener: call[1] };
}

beforeEach(() => {
  vi.clearAllMocks();
  addListener.mockResolvedValue({ remove });
});

describe('subscribeToAppStateChange', () => {
  it('maps the foreground state onto the callback', () => {
    const onChange = vi.fn();

    subscribeToAppStateChange(onChange);
    const { eventName, listener } = lastRegistration();
    listener({ isActive: true });

    expect(eventName).toBe('appStateChange');
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('maps the background state onto the callback', () => {
    const onChange = vi.fn();

    subscribeToAppStateChange(onChange);
    lastRegistration().listener({ isActive: false });

    expect(onChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('removes the plugin listener on cleanup', async () => {
    const cleanup = subscribeToAppStateChange(vi.fn());

    cleanup();

    await vi.waitFor(() => {
      expect(remove).toHaveBeenCalledTimes(1);
    });
  });
});

describe('subscribeToHardwareBackButton', () => {
  it('forwards a stack that cannot go back', () => {
    const onBack = vi.fn();

    subscribeToHardwareBackButton(onBack);
    const { eventName, listener } = lastRegistration();
    listener({ canGoBack: false });

    expect(eventName).toBe('backButton');
    expect(onBack).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('forwards a back-navigable stack', () => {
    const onBack = vi.fn();

    subscribeToHardwareBackButton(onBack);
    lastRegistration().listener({ canGoBack: true });

    expect(onBack).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('removes the plugin listener on cleanup', async () => {
    const cleanup = subscribeToHardwareBackButton(vi.fn());

    cleanup();

    await vi.waitFor(() => {
      expect(remove).toHaveBeenCalledTimes(1);
    });
  });
});

describe('subscribeToAppUrlOpen', () => {
  it('forwards the opened deep link', () => {
    const onOpen = vi.fn();

    subscribeToAppUrlOpen(onOpen);
    const { eventName, listener } = lastRegistration();
    listener({ url: 'ranger://home' });

    expect(eventName).toBe('appUrlOpen');
    expect(onOpen).toHaveBeenCalledExactlyOnceWith('ranger://home');
  });

  it('removes the plugin listener on cleanup', async () => {
    const cleanup = subscribeToAppUrlOpen(vi.fn());

    cleanup();

    await vi.waitFor(() => {
      expect(remove).toHaveBeenCalledTimes(1);
    });
  });
});

describe('getLaunchUrl', () => {
  it('returns the url the app was launched with', async () => {
    readLaunchUrl.mockResolvedValue({ url: 'ranger://launch' });

    await expect(getLaunchUrl()).resolves.toBe('ranger://launch');
  });

  it('returns null when the app was launched without a url', async () => {
    readLaunchUrl.mockResolvedValue(undefined);

    await expect(getLaunchUrl()).resolves.toBeNull();
  });
});

describe('exitApp', () => {
  it('asks the plugin to exit', () => {
    exitApp();

    expect(quitApp).toHaveBeenCalledTimes(1);
  });
});
