import { Device } from '@capacitor/device';

export interface DeviceSummary {
  readonly platform: string;
  readonly model: string;
  readonly osVersion: string;
}

export async function getDeviceSummary(): Promise<DeviceSummary> {
  const info = await Device.getInfo();
  return { platform: info.platform, model: info.model, osVersion: info.osVersion };
}
