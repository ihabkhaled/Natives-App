import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getNetworkSnapshot, subscribeToNetworkChanges } from './capacitor-network.facade';

interface PluginStatus {
  connected: boolean;
  connectionType: string;
}

const { getStatus, addListener, remove } = vi.hoisted(() => ({
  getStatus: vi.fn<() => Promise<{ connected: boolean; connectionType: string }>>(),
  addListener:
    vi.fn<
      (
        eventName: string,
        listener: (status: { connected: boolean; connectionType: string }) => void,
      ) => Promise<{ remove: () => Promise<void> }>
    >(),
  remove: vi.fn<() => Promise<void>>(),
}));

vi.mock('@capacitor/network', () => ({ Network: { getStatus, addListener } }));

function registeredListener(): (status: PluginStatus) => void {
  const call = addListener.mock.lastCall;
  if (call === undefined) {
    throw new Error('the facade never called Network.addListener');
  }
  return call[1];
}

beforeEach(() => {
  vi.clearAllMocks();
  addListener.mockResolvedValue({ remove });
});

describe('getNetworkSnapshot', () => {
  it('projects the plugin status onto the snapshot shape', async () => {
    getStatus.mockResolvedValue({ connected: true, connectionType: 'wifi' });

    await expect(getNetworkSnapshot()).resolves.toEqual({
      connected: true,
      connectionType: 'wifi',
    });
  });

  it('reports an offline device', async () => {
    getStatus.mockResolvedValue({ connected: false, connectionType: 'none' });

    await expect(getNetworkSnapshot()).resolves.toEqual({
      connected: false,
      connectionType: 'none',
    });
  });
});

describe('subscribeToNetworkChanges', () => {
  it('subscribes to the plugin status event', () => {
    subscribeToNetworkChanges(vi.fn());

    expect(addListener.mock.lastCall?.[0]).toBe('networkStatusChange');
  });

  it('forwards a connectivity drop', () => {
    const onChange = vi.fn();

    subscribeToNetworkChanges(onChange);
    registeredListener()({ connected: false, connectionType: 'none' });

    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      connected: false,
      connectionType: 'none',
    });
  });

  it('forwards a reconnection', () => {
    const onChange = vi.fn();

    subscribeToNetworkChanges(onChange);
    registeredListener()({ connected: true, connectionType: 'cellular' });

    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      connected: true,
      connectionType: 'cellular',
    });
  });

  it('removes the plugin listener on cleanup', async () => {
    const cleanup = subscribeToNetworkChanges(vi.fn());

    cleanup();

    await vi.waitFor(() => {
      expect(remove).toHaveBeenCalledTimes(1);
    });
  });
});
