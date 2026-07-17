import { Capacitor } from '@capacitor/core';

export type RuntimePlatform = 'android' | 'ios' | 'web';

/** The Capacitor core owner: runtime detection lives here only. */
export function isNativeRuntime(): boolean {
  return Capacitor.isNativePlatform();
}

export function getRuntimePlatform(): RuntimePlatform {
  const platform = Capacitor.getPlatform();
  if (platform === 'android' || platform === 'ios') {
    return platform;
  }
  return 'web';
}
