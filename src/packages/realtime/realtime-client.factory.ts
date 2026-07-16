import { io } from 'socket.io-client';

import type { RealtimeClient, RealtimeClientOptions } from './realtime.types';

/**
 * Socket.IO owner for NestJS WebSocket gateways. The client never
 * auto-connects: features opt in explicitly and must disconnect on cleanup.
 */
export function createRealtimeClient(options: RealtimeClientOptions): RealtimeClient {
  const socket = io(options.url, {
    autoConnect: false,
    transports: ['websocket'],
    auth: (setAuth) => {
      const tokenPromise = options.getAccessToken?.() ?? Promise.resolve(null);
      void tokenPromise.then((token) => {
        setAuth(token === null ? {} : { token });
      });
    },
  });
  return {
    connect: () => {
      socket.connect();
    },
    disconnect: () => {
      socket.disconnect();
    },
    isConnected: () => socket.connected,
    on: (event, listener) => {
      socket.on(event, listener);
      return () => {
        socket.off(event, listener);
      };
    },
    emit: (event, payload) => {
      socket.emit(event, payload);
    },
  };
}
