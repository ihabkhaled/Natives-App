import { Capacitor } from '@capacitor/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getDeviceSummary } from '@/packages/capacitor-device';

import { getDeviceInformation } from './device.facade';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn(), getPlatform: vi.fn() },
}));
vi.mock('@/packages/capacitor-device', () => ({ getDeviceSummary: vi.fn() }));

const isNativePlatformMock = vi.mocked(Capacitor.isNativePlatform);
const getPlatformMock = vi.mocked(Capacitor.getPlatform);
const getDeviceSummaryMock = vi.mocked(getDeviceSummary);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getDeviceInformation', () => {
  it('combines the device summary with the runtime platform on native', async () => {
    getPlatformMock.mockReturnValue('ios');
    isNativePlatformMock.mockReturnValue(true);
    getDeviceSummaryMock.mockResolvedValue({
      platform: 'ios',
      model: 'iPhone15,2',
      osVersion: '17.4',
    });

    await expect(getDeviceInformation()).resolves.toEqual({
      platform: 'ios',
      model: 'iPhone15,2',
      osVersion: '17.4',
      isNative: true,
    });
  });

  it('reports the web runtime when the app runs in a browser', async () => {
    getPlatformMock.mockReturnValue('web');
    isNativePlatformMock.mockReturnValue(false);
    getDeviceSummaryMock.mockResolvedValue({
      platform: 'web',
      model: 'Chrome',
      osVersion: '120.0.0',
    });

    await expect(getDeviceInformation()).resolves.toEqual({
      platform: 'web',
      model: 'Chrome',
      osVersion: '120.0.0',
      isNative: false,
    });
  });

  it('prefers the runtime platform over the raw plugin platform', async () => {
    getPlatformMock.mockReturnValue('electron');
    isNativePlatformMock.mockReturnValue(false);
    getDeviceSummaryMock.mockResolvedValue({
      platform: 'electron',
      model: 'Desktop',
      osVersion: '1.0',
    });

    const information = await getDeviceInformation();

    expect(information.platform).toBe('web');
    expect(getDeviceSummaryMock).toHaveBeenCalledOnce();
  });
});
