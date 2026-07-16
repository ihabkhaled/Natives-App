import { useEffect, useState } from 'react';

import { getDeviceInformation, type DeviceInformation } from '@/platform';

export interface RuntimeInfoView {
  readonly device: DeviceInformation | undefined;
}

/** Async native runtime information with cancellation on unmount. */
export function useRuntimeInfo(): RuntimeInfoView {
  const [device, setDevice] = useState<DeviceInformation | undefined>(undefined);
  useEffect(() => {
    let disposed = false;
    void getDeviceInformation().then((information) => {
      if (!disposed) {
        setDevice(information);
      }
    });
    return () => {
      disposed = true;
    };
  }, []);
  return { device };
}
