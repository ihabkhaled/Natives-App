import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as EnvironmentPackage from '@/packages/environment';
import { getEnvironment, type AppEnvironment } from '@/packages/environment';
import type * as I18nPackage from '@/packages/i18n';
import { useAppTranslation } from '@/packages/i18n';
import type * as PlatformModule from '@/platform';
import {
  getPlatformLogger,
  isNativeRuntime,
  registerPwaServiceWorker,
  reloadApplication,
  type ApplyPwaUpdate,
  type PwaServiceWorkerOptions,
} from '@/platform';
import type * as SharedUiModule from '@/shared/ui';
import { useAppToast, type ShowToastOptions } from '@/shared/ui';

import { usePwaLifecycle } from './use-pwa-lifecycle.hook';

vi.mock('@/packages/environment', async (importOriginal) => ({
  ...(await importOriginal<typeof EnvironmentPackage>()),
  getEnvironment: vi.fn(),
}));

vi.mock('@/packages/i18n', async (importOriginal) => ({
  ...(await importOriginal<typeof I18nPackage>()),
  useAppTranslation: vi.fn(),
}));

vi.mock('@/platform', async (importOriginal) => ({
  ...(await importOriginal<typeof PlatformModule>()),
  getPlatformLogger: vi.fn(),
  isNativeRuntime: vi.fn(),
  registerPwaServiceWorker: vi.fn(),
  reloadApplication: vi.fn(),
}));

vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedUiModule>()),
  useAppToast: vi.fn(),
}));

const dispose = vi.fn();
const checkForUpdate = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
const showToast = vi
  .fn<(options: ShowToastOptions) => Promise<void>>()
  .mockResolvedValue(undefined);
const warn = vi.fn();
const translate = vi.fn((key: string) => key);
const logger = { debug: vi.fn(), info: vi.fn(), warn, error: vi.fn() };

const PRODUCTION_ENVIRONMENT: AppEnvironment = {
  appName: 'Ultimate Natives',
  appId: 'com.ultimatenatives.app',
  apiBaseUrl: 'http://localhost:3000',
  apiMode: 'remote',
  apiTimeoutMs: 10_000,
  defaultLocale: 'en',
  supportedLocales: ['en', 'ar'],
  defaultTheme: 'system',
  sentryDsn: undefined,
  socketUrl: undefined,
  enableQueryDevtools: false,
  isDevelopment: false,
  isProduction: true,
  mode: 'production',
};

function registrationOptions(): PwaServiceWorkerOptions {
  return vi.mocked(registerPwaServiceWorker).mock.calls[0]![0];
}

function mountPwaLifecycle(): ReturnType<typeof renderHook<void, unknown>> {
  return renderHook(() => {
    usePwaLifecycle();
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getEnvironment).mockReturnValue(PRODUCTION_ENVIRONMENT);
  vi.mocked(useAppTranslation).mockReturnValue({
    t: translate,
    locale: 'en',
  });
  vi.mocked(useAppToast).mockReturnValue({ showToast });
  vi.mocked(isNativeRuntime).mockReturnValue(false);
  vi.mocked(getPlatformLogger).mockReturnValue(logger);
  vi.mocked(registerPwaServiceWorker).mockReturnValue({ dispose, checkForUpdate });
});

describe('usePwaLifecycle', () => {
  it('enables the worker only for a production web runtime', () => {
    mountPwaLifecycle();

    expect(registrationOptions().enabled).toBe(true);
  });

  it('disables the worker during development', () => {
    vi.mocked(getEnvironment).mockReturnValue({
      ...PRODUCTION_ENVIRONMENT,
      isProduction: false,
    });

    mountPwaLifecycle();

    expect(registrationOptions().enabled).toBe(false);
  });

  it('disables the web worker inside a native Capacitor runtime', () => {
    vi.mocked(isNativeRuntime).mockReturnValue(true);

    mountPwaLifecycle();

    expect(registrationOptions().enabled).toBe(false);
  });

  it('presents a localized persistent restart action for a waiting update', () => {
    const applyUpdate = vi.fn<ApplyPwaUpdate>().mockResolvedValue('requested');
    mountPwaLifecycle();

    registrationOptions().onUpdateReady(applyUpdate);
    const toast = showToast.mock.calls[0]![0];
    toast.action?.onSelect();

    expect(showToast).toHaveBeenCalledOnce();
    expect(toast.message).toBe('pwa.updateReady');
    expect(toast.durationMs).toBe(0);
    expect(toast.action?.label).toBe('pwa.updateAction');
    expect(typeof toast.action?.onSelect).toBe('function');
    expect(applyUpdate).toHaveBeenCalledOnce();
  });

  it('warns without applying when the preservation gate blocks an update', () => {
    mountPwaLifecycle();

    registrationOptions().onUpdateBlocked();

    expect(showToast).toHaveBeenCalledExactlyOnceWith({
      message: 'pwa.updateBlocked',
      tone: 'warning',
    });
  });

  it('reloads only through the platform callback after activation', () => {
    mountPwaLifecycle();

    registrationOptions().onActivated();

    expect(reloadApplication).toHaveBeenCalledOnce();
  });

  it('logs a sanitized lifecycle failure without a raw browser error', () => {
    mountPwaLifecycle();

    registrationOptions().onError();

    expect(warn).toHaveBeenCalledExactlyOnceWith('PWA service worker lifecycle unavailable');
  });

  it('uses the latest translation and toast functions without re-registering', () => {
    const nextShowToast = vi
      .fn<(options: ShowToastOptions) => Promise<void>>()
      .mockResolvedValue(undefined);
    const nextTranslate = vi.fn((key: string) => `next:${key}`);
    const { rerender } = mountPwaLifecycle();
    vi.mocked(useAppTranslation).mockReturnValue({
      t: nextTranslate,
      locale: 'en',
    });
    vi.mocked(useAppToast).mockReturnValue({ showToast: nextShowToast });

    rerender();
    registrationOptions().onUpdateBlocked();

    expect(registerPwaServiceWorker).toHaveBeenCalledOnce();
    expect(nextShowToast).toHaveBeenCalledWith({
      message: 'next:pwa.updateBlocked',
      tone: 'warning',
    });
  });

  it('disposes the platform lifecycle on unmount', () => {
    const { unmount } = mountPwaLifecycle();

    unmount();

    expect(dispose).toHaveBeenCalledOnce();
  });

  it('declares the current no-queue preservation gate safe', async () => {
    mountPwaLifecycle();

    await expect(registrationOptions().preserveState()).resolves.toBe(true);
  });
});
