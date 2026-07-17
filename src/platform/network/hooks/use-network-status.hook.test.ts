import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getNetworkSnapshot,
  subscribeToNetworkChanges,
  type NetworkSnapshot,
} from '@/packages/capacitor-network';

import { useNetworkStatus } from './use-network-status.hook';

vi.mock('@/packages/capacitor-network', () => ({
  getNetworkSnapshot: vi.fn(),
  subscribeToNetworkChanges: vi.fn(),
}));

const getNetworkSnapshotMock = vi.mocked(getNetworkSnapshot);
const subscribeToNetworkChangesMock = vi.mocked(subscribeToNetworkChanges);

function captureNetworkListener(): (snapshot: NetworkSnapshot) => void {
  return subscribeToNetworkChangesMock.mock.calls[0]![0];
}

beforeEach(() => {
  vi.clearAllMocks();
  getNetworkSnapshotMock.mockResolvedValue({ connected: true, connectionType: 'wifi' });
  subscribeToNetworkChangesMock.mockReturnValue(vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useNetworkStatus', () => {
  it('assumes connectivity until the first snapshot arrives', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current).toEqual({ isOnline: true });
  });

  it('seeds the state from the current network snapshot', async () => {
    getNetworkSnapshotMock.mockResolvedValue({ connected: false, connectionType: 'none' });

    const { result } = renderHook(() => useNetworkStatus());

    await vi.waitFor(() => {
      expect(result.current.isOnline).toBe(false);
    });
    expect(getNetworkSnapshotMock).toHaveBeenCalledOnce();
  });

  it('flips when the network owner reports a change', async () => {
    const { result } = renderHook(() => useNetworkStatus());
    await vi.waitFor(() => {
      expect(subscribeToNetworkChangesMock).toHaveBeenCalledOnce();
    });
    const listener = captureNetworkListener();

    act(() => {
      listener({ connected: false, connectionType: 'none' });
    });
    expect(result.current.isOnline).toBe(false);

    act(() => {
      listener({ connected: true, connectionType: 'cellular' });
    });
    expect(result.current.isOnline).toBe(true);
  });

  it('removes the native listener on unmount', () => {
    const unsubscribe = vi.fn();
    subscribeToNetworkChangesMock.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useNetworkStatus());
    expect(unsubscribe).not.toHaveBeenCalled();

    unmount();

    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('ignores a snapshot that resolves after unmount', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const unsubscribe = vi.fn();
    subscribeToNetworkChangesMock.mockReturnValue(unsubscribe);
    let resolveSnapshot: (snapshot: NetworkSnapshot) => void = () => undefined;
    getNetworkSnapshotMock.mockReturnValue(
      new Promise<NetworkSnapshot>((resolve) => {
        resolveSnapshot = resolve;
      }),
    );

    const { unmount } = renderHook(() => useNetworkStatus());
    unmount();
    resolveSnapshot({ connected: false, connectionType: 'none' });
    await vi.waitFor(() => {
      expect(unsubscribe).toHaveBeenCalledOnce();
    });

    expect(errorSpy).not.toHaveBeenCalled();
  });
});
