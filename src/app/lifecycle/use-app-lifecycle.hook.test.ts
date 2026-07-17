import { renderHook } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as RouterPackage from '@/packages/router';
import { useIonRouter } from '@/packages/router';
import type * as PlatformModule from '@/platform';
import {
  registerHardwareBackHandler,
  startDeepLinkListener,
  subscribeToAppLifecycle,
  type AppLifecycleCallbacks,
  type DeepLinkListenerOptions,
  type HardwareBackHandlerOptions,
} from '@/platform';
import type * as SharedUiModule from '@/shared/ui';
import { useAppToast } from '@/shared/ui';

import { initTestI18n } from '../../../tests/setup/i18n-test.helper';
import { APP_DEEP_LINK_POLICY } from '../router/deep-link-policy.constants';
import { useAppLifecycle } from './use-app-lifecycle.hook';

vi.mock('@/platform', async (importOriginal) => ({
  ...(await importOriginal<typeof PlatformModule>()),
  registerHardwareBackHandler: vi.fn(),
  startDeepLinkListener: vi.fn(),
  subscribeToAppLifecycle: vi.fn(),
}));

vi.mock('@/packages/router', async (importOriginal) => ({
  ...(await importOriginal<typeof RouterPackage>()),
  useIonRouter: vi.fn(),
}));

vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedUiModule>()),
  useAppToast: vi.fn(),
}));

const cleanupBackButton = vi.fn();
const cleanupDeepLinks = vi.fn();
const cleanupAppState = vi.fn();
const showToast = vi.fn<() => Promise<void>>();

const ionRouter = { canGoBack: vi.fn(), goBack: vi.fn(), push: vi.fn() };

function backHandlerOptions(): HardwareBackHandlerOptions {
  return vi.mocked(registerHardwareBackHandler).mock.calls[0]![0];
}

function deepLinkOptions(): DeepLinkListenerOptions {
  return vi.mocked(startDeepLinkListener).mock.calls[0]![0];
}

function lifecycleCallbacks(): AppLifecycleCallbacks {
  return vi.mocked(subscribeToAppLifecycle).mock.calls[0]![0];
}

function mountLifecycle(): ReturnType<typeof renderHook<void, unknown>> {
  return renderHook(() => {
    useAppLifecycle();
  });
}

beforeAll(async () => {
  await initTestI18n();
});

// Cleared here, not in afterEach: the global testing-library cleanup unmounts
// after this file's afterEach hooks, so unmount cleanups would leak forward.
beforeEach(() => {
  vi.clearAllMocks();
  ionRouter.canGoBack.mockReturnValue(true);
  vi.mocked(useIonRouter).mockReturnValue(ionRouter as unknown as ReturnType<typeof useIonRouter>);
  showToast.mockResolvedValue();
  vi.mocked(useAppToast).mockReturnValue({ showToast });
  vi.mocked(registerHardwareBackHandler).mockReturnValue(cleanupBackButton);
  vi.mocked(startDeepLinkListener).mockReturnValue(cleanupDeepLinks);
  vi.mocked(subscribeToAppLifecycle).mockReturnValue(cleanupAppState);
});

describe('useAppLifecycle', () => {
  it('registers every native listener exactly once per mount', () => {
    mountLifecycle();

    expect(registerHardwareBackHandler).toHaveBeenCalledOnce();
    expect(startDeepLinkListener).toHaveBeenCalledOnce();
    expect(subscribeToAppLifecycle).toHaveBeenCalledOnce();
  });

  it('registers the listeners once only, however often it re-renders', () => {
    const { rerender } = mountLifecycle();

    rerender();
    rerender();

    expect(registerHardwareBackHandler).toHaveBeenCalledOnce();
    expect(startDeepLinkListener).toHaveBeenCalledOnce();
  });

  it('guards deep links with the strict app allowlist', () => {
    mountLifecycle();

    expect(deepLinkOptions().policy).toBe(APP_DEEP_LINK_POLICY);
  });

  it('routes an accepted deep link through the Ionic router as a root replace', () => {
    mountLifecycle();

    deepLinkOptions().onNavigate('/settings');

    expect(ionRouter.push).toHaveBeenCalledExactlyOnceWith('/settings', 'root', 'replace');
  });

  it('warns the user in translated copy when a deep link is rejected', () => {
    mountLifecycle();

    deepLinkOptions().onRejected?.('https://evil.example.com/home');

    expect(showToast).toHaveBeenCalledExactlyOnceWith({
      message: 'That link cannot be opened.',
      tone: 'warning',
    });
  });

  it('never navigates on a rejected deep link', () => {
    mountLifecycle();

    deepLinkOptions().onRejected?.('https://evil.example.com/home');

    expect(ionRouter.push).not.toHaveBeenCalled();
  });

  it('reports whether the router can go back to the hardware back handler', () => {
    mountLifecycle();

    expect(backHandlerOptions().canGoBack()).toBe(true);

    ionRouter.canGoBack.mockReturnValue(false);
    expect(backHandlerOptions().canGoBack()).toBe(false);
  });

  it('navigates back through the router on hardware back', () => {
    mountLifecycle();

    backHandlerOptions().goBack();

    expect(ionRouter.goBack).toHaveBeenCalledOnce();
  });

  it('survives foreground and background transitions', () => {
    mountLifecycle();
    const callbacks = lifecycleCallbacks();

    expect(() => {
      callbacks.onForeground?.();
      callbacks.onBackground?.();
    }).not.toThrow();
  });

  it('tears down every native listener on unmount', () => {
    const { unmount } = mountLifecycle();

    unmount();

    expect(cleanupBackButton).toHaveBeenCalledOnce();
    expect(cleanupDeepLinks).toHaveBeenCalledOnce();
    expect(cleanupAppState).toHaveBeenCalledOnce();
  });

  it('keeps using the latest router after a re-render', () => {
    const { rerender } = mountLifecycle();
    const nextRouter = { canGoBack: vi.fn(() => true), goBack: vi.fn(), push: vi.fn() };
    vi.mocked(useIonRouter).mockReturnValue(
      nextRouter as unknown as ReturnType<typeof useIonRouter>,
    );

    rerender();
    deepLinkOptions().onNavigate('/home');

    expect(nextRouter.push).toHaveBeenCalledExactlyOnceWith('/home', 'root', 'replace');
    expect(ionRouter.push).not.toHaveBeenCalled();
  });
});
