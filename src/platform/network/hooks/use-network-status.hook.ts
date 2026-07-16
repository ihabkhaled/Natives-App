import { useEffect, useState } from 'react';

import { getNetworkSnapshot, subscribeToNetworkChanges } from '@/packages/capacitor-network';

export interface NetworkStatus {
  readonly isOnline: boolean;
}

/**
 * Observe connectivity through the network owner. Subscribes on mount,
 * seeds from the current snapshot, and always cleans up (Strict Mode safe).
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    let disposed = false;
    void getNetworkSnapshot().then((snapshot) => {
      if (!disposed) {
        setIsOnline(snapshot.connected);
      }
    });
    const unsubscribe = subscribeToNetworkChanges((snapshot) => {
      setIsOnline(snapshot.connected);
    });
    return () => {
      disposed = true;
      unsubscribe();
    };
  }, []);
  return { isOnline };
}
