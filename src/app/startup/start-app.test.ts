import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  bootstrapSessionFromStoredTokens,
  createRefreshExecutor,
  getAuthTokenRepository,
  handleAuthFailure,
} from '@/modules/auth';
import type * as EnvironmentPackage from '@/packages/environment';
import { getEnvironment, type AppEnvironment } from '@/packages/environment';
import { initErrorReporting } from '@/packages/error-reporting';
import type * as HttpPackage from '@/packages/http';
import { configureAppHttpClient, createHttpClient, type HttpClient } from '@/packages/http';
import type * as I18nPackage from '@/packages/i18n';
import { initI18n } from '@/packages/i18n';
import { setupIonicReact } from '@/packages/ionic';
import { startMockWorker } from '@/tests/msw/browser';
import { API_MODE } from '@/shared/enums';

import { startApp } from './start-app';

const HTTP_CLIENT = { marker: 'http-client' } as unknown as HttpClient;
const TOKEN_REPOSITORY = { marker: 'token-repository' };
const REFRESH_EXECUTOR = vi.fn();

vi.mock('@/modules/auth', () => ({
  bootstrapSessionFromStoredTokens: vi.fn(),
  createRefreshExecutor: vi.fn(),
  getAuthTokenRepository: vi.fn(),
  handleAuthFailure: vi.fn(),
}));

vi.mock('@/packages/error-reporting', () => ({ initErrorReporting: vi.fn() }));

vi.mock('@/packages/http', async (importOriginal) => ({
  ...(await importOriginal<typeof HttpPackage>()),
  configureAppHttpClient: vi.fn(),
  createHttpClient: vi.fn(),
}));

vi.mock('@/packages/i18n', async (importOriginal) => ({
  ...(await importOriginal<typeof I18nPackage>()),
  initI18n: vi.fn(),
}));

vi.mock('@/packages/ionic', () => ({ setupIonicReact: vi.fn() }));

vi.mock('@/tests/msw/browser', () => ({ startMockWorker: vi.fn() }));

vi.mock('@/packages/environment', async (importOriginal) => ({
  ...(await importOriginal<typeof EnvironmentPackage>()),
  getEnvironment: vi.fn(),
}));

const { getEnvironment: readRealEnvironment } =
  await vi.importActual<typeof EnvironmentPackage>('@/packages/environment');
const REAL_ENVIRONMENT = readRealEnvironment();

function mockEnvironment(overrides: Partial<AppEnvironment> = {}): void {
  vi.mocked(getEnvironment).mockReturnValue({ ...REAL_ENVIRONMENT, ...overrides });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockEnvironment();
  vi.mocked(createHttpClient).mockReturnValue(HTTP_CLIENT);
  vi.mocked(getAuthTokenRepository).mockReturnValue(
    TOKEN_REPOSITORY as unknown as ReturnType<typeof getAuthTokenRepository>,
  );
  vi.mocked(createRefreshExecutor).mockReturnValue(REFRESH_EXECUTOR);
  vi.mocked(initI18n).mockResolvedValue();
  vi.mocked(startMockWorker).mockResolvedValue();
  vi.mocked(bootstrapSessionFromStoredTokens).mockResolvedValue();
});

describe('startApp', () => {
  it('installs the Ionic runtime before anything renders', async () => {
    await startApp();

    expect(setupIonicReact).toHaveBeenCalledOnce();
    expect(vi.mocked(setupIonicReact).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(initI18n).mock.invocationCallOrder[0]!,
    );
  });

  it('initializes i18n with both bundled catalogs and the environment locales', async () => {
    await startApp();

    expect(initI18n).toHaveBeenCalledOnce();
    const [options] = vi.mocked(initI18n).mock.calls[0]!;
    expect(Object.keys(options.resources).sort()).toEqual(['ar', 'en']);
    expect(options.defaultLocale).toBe(REAL_ENVIRONMENT.defaultLocale);
    expect(options.supportedLocales).toEqual(REAL_ENVIRONMENT.supportedLocales);
  });

  it('hands the composed HTTP client to the app-wide owner', async () => {
    await startApp();

    expect(configureAppHttpClient).toHaveBeenCalledExactlyOnceWith(HTTP_CLIENT);
  });

  it('builds the HTTP client from the environment and the auth module seams', async () => {
    await startApp();

    const [dependencies] = vi.mocked(createHttpClient).mock.calls[0]!;
    expect(dependencies.config).toEqual({
      baseUrl: REAL_ENVIRONMENT.apiBaseUrl,
      timeoutMs: REAL_ENVIRONMENT.apiTimeoutMs,
    });
    expect(dependencies.tokenStore).toBe(TOKEN_REPOSITORY);
    expect(dependencies.refreshExecutor).toBe(REFRESH_EXECUTOR);
    expect(dependencies.onAuthFailure).toBe(handleAuthFailure);
  });

  it('initializes error reporting from the environment', async () => {
    await startApp();

    expect(initErrorReporting).toHaveBeenCalledExactlyOnceWith({
      dsn: REAL_ENVIRONMENT.sentryDsn,
      environment: REAL_ENVIRONMENT.mode,
    });
  });

  it('restores the stored session last, once every seam is wired', async () => {
    await startApp();

    expect(bootstrapSessionFromStoredTokens).toHaveBeenCalledOnce();
    expect(vi.mocked(bootstrapSessionFromStoredTokens).mock.invocationCallOrder[0]).toBeGreaterThan(
      vi.mocked(configureAppHttpClient).mock.invocationCallOrder[0]!,
    );
  });

  it('starts the mock worker in mock mode outside production', async () => {
    await startApp();

    expect(startMockWorker).toHaveBeenCalledOnce();
  });

  it('never starts the mock worker against a remote API', async () => {
    mockEnvironment({ apiMode: API_MODE.Remote });

    await startApp();

    expect(startMockWorker).not.toHaveBeenCalled();
    expect(bootstrapSessionFromStoredTokens).toHaveBeenCalledOnce();
  });

  it('never starts the mock worker in a production build', async () => {
    mockEnvironment({ apiMode: API_MODE.Mock, isProduction: true });

    await startApp();

    expect(startMockWorker).not.toHaveBeenCalled();
  });
});
