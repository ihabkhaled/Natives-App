import { exitApp, subscribeToHardwareBackButton } from '@/packages/capacitor-app';

export interface HardwareBackHandlerOptions {
  readonly canGoBack: () => boolean;
  readonly goBack: () => void;
}

/**
 * The single Android hardware-back owner: navigate back while history
 * exists, otherwise exit the app. Registered once by the app lifecycle.
 */
export function registerHardwareBackHandler(options: HardwareBackHandlerOptions): () => void {
  return subscribeToHardwareBackButton(() => {
    if (options.canGoBack()) {
      options.goBack();
      return;
    }
    exitApp();
  });
}
