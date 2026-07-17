import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type * as PlatformModule from '@/platform';
import { getDeviceInformation, type DeviceInformation } from '@/platform';

import { useRuntimeInfo } from './use-runtime-info.hook';

vi.mock('@/platform', async (importOriginal) => ({
  ...(await importOriginal<typeof PlatformModule>()),
  getDeviceInformation: vi.fn(),
}));

const DEVICE: DeviceInformation = {
  platform: 'web',
  model: 'Chrome',
  osVersion: '140.0',
  isNative: false,
};

interface Deferred {
  readonly promise: Promise<DeviceInformation>;
  readonly resolve: (information: DeviceInformation) => void;
}

function defer(): Deferred {
  let resolveDevice: (information: DeviceInformation) => void = () => undefined;
  const promise = new Promise<DeviceInformation>((resolve) => {
    resolveDevice = resolve;
  });
  return { promise, resolve: resolveDevice };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('useRuntimeInfo', () => {
  it('starts with no device information', () => {
    vi.mocked(getDeviceInformation).mockReturnValue(defer().promise);

    const { result } = renderHook(() => useRuntimeInfo());

    expect(result.current.device).toBeUndefined();
  });

  it('publishes the device information once it resolves', async () => {
    vi.mocked(getDeviceInformation).mockResolvedValue(DEVICE);

    const { result } = renderHook(() => useRuntimeInfo());

    await waitFor(() => {
      expect(result.current.device).toEqual(DEVICE);
    });
  });

  it('asks the platform owner exactly once per mount', async () => {
    vi.mocked(getDeviceInformation).mockResolvedValue(DEVICE);

    const { result } = renderHook(() => useRuntimeInfo());
    await waitFor(() => {
      expect(result.current.device).toEqual(DEVICE);
    });

    expect(getDeviceInformation).toHaveBeenCalledOnce();
  });

  it('never updates state when the hook unmounts before the lookup resolves', async () => {
    const deferred = defer();
    vi.mocked(getDeviceInformation).mockReturnValue(deferred.promise);

    const { result, unmount } = renderHook(() => useRuntimeInfo());
    unmount();
    deferred.resolve(DEVICE);
    await deferred.promise;

    expect(result.current.device).toBeUndefined();
  });
});
