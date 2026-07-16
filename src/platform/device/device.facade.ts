import { getDeviceSummary } from '@/packages/capacitor-device';

import { getRuntimePlatform, isNativeRuntime, type RuntimePlatform } from '../runtime/runtime.facade';

export interface DeviceInformation {
  readonly platform: RuntimePlatform;
  readonly model: string;
  readonly osVersion: string;
  readonly isNative: boolean;
}

export async function getDeviceInformation(): Promise<DeviceInformation> {
  const summary = await getDeviceSummary();
  return {
    platform: getRuntimePlatform(),
    model: summary.model,
    osVersion: summary.osVersion,
    isNative: isNativeRuntime(),
  };
}
