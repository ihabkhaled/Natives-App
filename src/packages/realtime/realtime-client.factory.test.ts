import { io, type Socket } from 'socket.io-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRealtimeClient } from './realtime-client.factory';

vi.mock('socket.io-client', () => ({ io: vi.fn() }));

function createFakeSocket() {
  return {
    connected: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  };
}

type FakeSocket = ReturnType<typeof createFakeSocket>;

let socket: FakeSocket;

beforeEach(() => {
  vi.clearAllMocks();
  socket = createFakeSocket();
  // The Socket surface is far larger than this double needs to be.
  vi.mocked(io).mockReturnValue(socket as unknown as Socket);
});

function connectOptions(): Partial<Parameters<typeof io>[1]> {
  const call = vi.mocked(io).mock.lastCall;
  if (call === undefined) {
    throw new Error('the factory never called io()');
  }
  return call[1];
}

function authCallback(): (setAuth: (payload: object) => void) => void {
  // socket.io types auth as a callback or a plain record, so narrow it here.
  const auth: unknown = connectOptions()?.auth;
  if (typeof auth !== 'function') {
    throw new TypeError('the factory never registered an auth callback');
  }
  return auth as (setAuth: (payload: object) => void) => void;
}

describe('createRealtimeClient', () => {
  it('opts out of auto-connect and pins the websocket transport', () => {
    createRealtimeClient({ url: 'wss://socket.test' });

    expect(vi.mocked(io).mock.lastCall?.[0]).toBe('wss://socket.test');
    expect(connectOptions()).toMatchObject({ autoConnect: false, transports: ['websocket'] });
  });

  it('connects and disconnects on demand', () => {
    const client = createRealtimeClient({ url: 'wss://socket.test' });

    client.connect();
    expect(socket.connect).toHaveBeenCalledTimes(1);

    client.disconnect();
    expect(socket.disconnect).toHaveBeenCalledTimes(1);
  });

  it('reports the live connection state', () => {
    const client = createRealtimeClient({ url: 'wss://socket.test' });

    expect(client.isConnected()).toBe(false);

    socket.connected = true;

    expect(client.isConnected()).toBe(true);
  });

  it('subscribes listeners and unsubscribes them on demand', () => {
    const client = createRealtimeClient({ url: 'wss://socket.test' });
    const listener = vi.fn();

    const unsubscribe = client.on('order:created', listener);

    expect(socket.on).toHaveBeenCalledExactlyOnceWith('order:created', listener);
    expect(socket.off).not.toHaveBeenCalled();

    unsubscribe();

    expect(socket.off).toHaveBeenCalledExactlyOnceWith('order:created', listener);
  });

  it('emits payloads through the socket', () => {
    const client = createRealtimeClient({ url: 'wss://socket.test' });

    client.emit('ping', { at: 1 });

    expect(socket.emit).toHaveBeenCalledExactlyOnceWith('ping', { at: 1 });
  });
});

describe('the realtime auth handshake', () => {
  it('sends the access token when one is available', async () => {
    const getAccessToken = vi.fn(() => Promise.resolve<string | null>('tok'));
    createRealtimeClient({ url: 'wss://socket.test', getAccessToken });
    const setAuth = vi.fn();

    authCallback()(setAuth);

    await vi.waitFor(() => {
      expect(setAuth).toHaveBeenCalledExactlyOnceWith({ token: 'tok' });
    });
    expect(getAccessToken).toHaveBeenCalledTimes(1);
  });

  it('sends an empty handshake when the token store is empty', async () => {
    createRealtimeClient({
      url: 'wss://socket.test',
      getAccessToken: () => Promise.resolve(null),
    });
    const setAuth = vi.fn();

    authCallback()(setAuth);

    await vi.waitFor(() => {
      expect(setAuth).toHaveBeenCalledExactlyOnceWith({});
    });
  });

  it('sends an empty handshake when no token store is wired', async () => {
    createRealtimeClient({ url: 'wss://socket.test' });
    const setAuth = vi.fn();

    authCallback()(setAuth);

    await vi.waitFor(() => {
      expect(setAuth).toHaveBeenCalledExactlyOnceWith({});
    });
  });

  it('re-reads the token on every handshake so reconnects stay authorized', async () => {
    const getAccessToken = vi
      .fn<() => Promise<string | null>>()
      .mockResolvedValueOnce('tok-1')
      .mockResolvedValueOnce('tok-2');
    createRealtimeClient({ url: 'wss://socket.test', getAccessToken });
    const setAuth = vi.fn();

    authCallback()(setAuth);
    authCallback()(setAuth);

    await vi.waitFor(() => {
      expect(setAuth).toHaveBeenCalledTimes(2);
    });
    expect(setAuth.mock.calls).toEqual([[{ token: 'tok-1' }], [{ token: 'tok-2' }]]);
  });
});
