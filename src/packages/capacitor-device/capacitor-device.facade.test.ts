import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getDeviceSummary } from './capacitor-device.facade';

const { getInfo } = vi.hoisted(() => ({
  getInfo: vi.fn<() => Promise<{ platform: string; model: string; osVersion: string }>>(),
}));

vi.mock('@capacitor/device', () => ({ Device: { getInfo } }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getDeviceSummary', () => {
  it('narrows the plugin info down to the fields the app uses', async () => {
    getInfo.mockResolvedValue({ platform: 'ios', model: 'iPhone15,2', osVersion: '17.4' });

    await expect(getDeviceSummary()).resolves.toEqual({
      platform: 'ios',
      model: 'iPhone15,2',
      osVersion: '17.4',
    });
    expect(getInfo).toHaveBeenCalledTimes(1);
  });

  it('summarizes a web runtime', async () => {
    getInfo.mockResolvedValue({ platform: 'web', model: 'Chrome', osVersion: '11' });

    await expect(getDeviceSummary()).resolves.toEqual({
      platform: 'web',
      model: 'Chrome',
      osVersion: '11',
    });
  });

  it('propagates a plugin failure', async () => {
    getInfo.mockRejectedValue(new Error('device info unavailable'));

    await expect(getDeviceSummary()).rejects.toThrow('device info unavailable');
  });
});
