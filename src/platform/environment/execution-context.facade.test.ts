import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getEnvironment, type AppEnvironment } from '@/packages/environment';
import { API_MODE } from '@/shared/enums';

import { getExecutionContext } from './execution-context.facade';

vi.mock('@/packages/environment', () => ({ getEnvironment: vi.fn() }));

const getEnvironmentMock = vi.mocked(getEnvironment);

function buildEnvironment(overrides: Partial<AppEnvironment> = {}): AppEnvironment {
  return {
    appName: 'Ultimate Natives',
    appId: 'com.ultimatenatives.app',
    apiBaseUrl: 'http://localhost:3000/api/v1',
    apiMode: 'mock',
    apiTimeoutMs: 5000,
    defaultLocale: 'en',
    supportedLocales: ['en', 'ar'],
    defaultTheme: 'system',
    sentryDsn: undefined,
    socketUrl: undefined,
    enableQueryDevtools: false,
    isDevelopment: true,
    isProduction: false,
    mode: 'test',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getExecutionContext', () => {
  describe('mock API mode', () => {
    it('exposes the mock api mode and the development flags', () => {
      getEnvironmentMock.mockReturnValue(
        buildEnvironment({ apiMode: 'mock', isDevelopment: true, isProduction: false }),
      );

      expect(getExecutionContext()).toEqual({
        apiMode: API_MODE.Mock,
        isDevelopment: true,
        isProduction: false,
      });
    });
  });

  describe('remote API mode', () => {
    it('exposes the remote api mode and the production flags', () => {
      getEnvironmentMock.mockReturnValue(
        buildEnvironment({ apiMode: 'remote', isDevelopment: false, isProduction: true }),
      );

      expect(getExecutionContext()).toEqual({
        apiMode: API_MODE.Remote,
        isDevelopment: false,
        isProduction: true,
      });
    });
  });

  it('narrows the environment to the execution contract only', () => {
    getEnvironmentMock.mockReturnValue(buildEnvironment({ apiMode: 'remote' }));

    expect(Object.keys(getExecutionContext()).sort()).toEqual([
      'apiMode',
      'isDevelopment',
      'isProduction',
    ]);
    expect(getEnvironmentMock).toHaveBeenCalledOnce();
  });
});
