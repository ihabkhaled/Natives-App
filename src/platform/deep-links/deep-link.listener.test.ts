import { Capacitor } from '@capacitor/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getLaunchUrl, subscribeToAppUrlOpen } from '@/packages/capacitor-app';

import { startDeepLinkListener } from './deep-link.listener';
import type { DeepLinkPolicy } from './deep-link.parser';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn(), getPlatform: vi.fn(() => 'web') },
}));
vi.mock('@/packages/capacitor-app', () => ({
  getLaunchUrl: vi.fn(),
  subscribeToAppUrlOpen: vi.fn(),
}));

const isNativePlatformMock = vi.mocked(Capacitor.isNativePlatform);
const getLaunchUrlMock = vi.mocked(getLaunchUrl);
const subscribeToAppUrlOpenMock = vi.mocked(subscribeToAppUrlOpen);

const POLICY: DeepLinkPolicy = {
  allowedSchemes: ['https'],
  allowedHosts: ['app.example.com'],
  allowedPathPrefixes: ['/home'],
};

function captureUrlListener(): (url: string) => void {
  return subscribeToAppUrlOpenMock.mock.calls[0]![0];
}

beforeEach(() => {
  vi.clearAllMocks();
  isNativePlatformMock.mockReturnValue(true);
  getLaunchUrlMock.mockResolvedValue(null);
  subscribeToAppUrlOpenMock.mockReturnValue(vi.fn());
});

describe('startDeepLinkListener', () => {
  it('routes an allowlisted cold-start launch URL', async () => {
    const onNavigate = vi.fn();
    getLaunchUrlMock.mockResolvedValue('https://app.example.com/home?tab=activity');

    startDeepLinkListener({ policy: POLICY, onNavigate });

    await vi.waitFor(() => {
      expect(onNavigate).toHaveBeenCalledExactlyOnceWith('/home?tab=activity');
    });
  });

  it('reports a rejected cold-start launch URL', async () => {
    const onNavigate = vi.fn();
    const onRejected = vi.fn();
    getLaunchUrlMock.mockResolvedValue('https://evil.example.com/home');

    startDeepLinkListener({ policy: POLICY, onNavigate, onRejected });

    await vi.waitFor(() => {
      expect(onRejected).toHaveBeenCalledExactlyOnceWith('https://evil.example.com/home');
    });
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('does nothing when the app was not launched from a link', async () => {
    const onNavigate = vi.fn();
    const onRejected = vi.fn();

    startDeepLinkListener({ policy: POLICY, onNavigate, onRejected });
    await vi.waitFor(() => {
      expect(getLaunchUrlMock).toHaveBeenCalledOnce();
    });
    await Promise.resolve();

    expect(onNavigate).not.toHaveBeenCalled();
    expect(onRejected).not.toHaveBeenCalled();
  });

  it('routes an allowlisted link opened while the app runs', () => {
    const onNavigate = vi.fn();

    startDeepLinkListener({ policy: POLICY, onNavigate });
    captureUrlListener()('https://app.example.com/home/details');

    expect(onNavigate).toHaveBeenCalledExactlyOnceWith('/home/details');
  });

  it('reports a link rejected while the app runs', () => {
    const onNavigate = vi.fn();
    const onRejected = vi.fn();

    startDeepLinkListener({ policy: POLICY, onNavigate, onRejected });
    captureUrlListener()('https://app.example.com/admin');

    expect(onRejected).toHaveBeenCalledExactlyOnceWith('https://app.example.com/admin');
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('survives a rejected link when no rejection handler is registered', () => {
    const onNavigate = vi.fn();

    startDeepLinkListener({ policy: POLICY, onNavigate });
    const listener = captureUrlListener();

    expect(() => {
      listener('not a url');
    }).not.toThrow();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('returns the native cleanup untouched', () => {
    const cleanup = vi.fn();
    subscribeToAppUrlOpenMock.mockReturnValue(cleanup);

    const stop = startDeepLinkListener({ policy: POLICY, onNavigate: vi.fn() });

    expect(stop).toBe(cleanup);
    expect(subscribeToAppUrlOpenMock).toHaveBeenCalledOnce();
  });

  describe('on the web runtime', () => {
    beforeEach(() => {
      isNativePlatformMock.mockReturnValue(false);
    });

    it('registers no listener, because the router already owns the browser URL', () => {
      const onNavigate = vi.fn();
      const onRejected = vi.fn();

      startDeepLinkListener({ policy: POLICY, onNavigate, onRejected });

      expect(getLaunchUrlMock).not.toHaveBeenCalled();
      expect(subscribeToAppUrlOpenMock).not.toHaveBeenCalled();
      expect(onNavigate).not.toHaveBeenCalled();
      expect(onRejected).not.toHaveBeenCalled();
    });

    it('returns a cleanup that is safe to call', () => {
      const stop = startDeepLinkListener({ policy: POLICY, onNavigate: vi.fn() });

      expect(() => {
        stop();
      }).not.toThrow();
    });
  });
});
