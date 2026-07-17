import { Capacitor } from '@capacitor/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getRuntimePlatform, isNativeRuntime } from './runtime.facade';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn(), getPlatform: vi.fn() },
}));

const isNativePlatformMock = vi.mocked(Capacitor.isNativePlatform);
const getPlatformMock = vi.mocked(Capacitor.getPlatform);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('isNativeRuntime', () => {
  it('reports true inside a native shell', () => {
    isNativePlatformMock.mockReturnValue(true);

    expect(isNativeRuntime()).toBe(true);
  });

  it('reports false in the browser', () => {
    isNativePlatformMock.mockReturnValue(false);

    expect(isNativeRuntime()).toBe(false);
  });
});

describe('getRuntimePlatform', () => {
  it.each(['android', 'ios'] as const)('passes the %s platform through', (platform) => {
    getPlatformMock.mockReturnValue(platform);

    expect(getRuntimePlatform()).toBe(platform);
  });

  it('reports web for the browser runtime', () => {
    getPlatformMock.mockReturnValue('web');

    expect(getRuntimePlatform()).toBe('web');
  });

  it('narrows every unsupported Capacitor platform to web', () => {
    getPlatformMock.mockReturnValue('electron');

    expect(getRuntimePlatform()).toBe('web');
  });
});
