import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';

type ListenerCleanup = () => void;

function toCleanup(handlePromise: Promise<PluginListenerHandle>): ListenerCleanup {
  return () => {
    void handlePromise.then((handle) => handle.remove());
  };
}

/** Fires with true when the app enters the foreground. */
export function subscribeToAppStateChange(
  onChange: (isActive: boolean) => void,
): ListenerCleanup {
  return toCleanup(
    App.addListener('appStateChange', (state) => {
      onChange(state.isActive);
    }),
  );
}

/** Android hardware back button. There must be exactly one app-level owner. */
export function subscribeToHardwareBackButton(
  onBack: (canGoBack: boolean) => void,
): ListenerCleanup {
  return toCleanup(
    App.addListener('backButton', (event) => {
      onBack(event.canGoBack);
    }),
  );
}

/** Deep links while the app is running. */
export function subscribeToAppUrlOpen(onOpen: (url: string) => void): ListenerCleanup {
  return toCleanup(
    App.addListener('appUrlOpen', (event) => {
      onOpen(event.url);
    }),
  );
}

export async function getLaunchUrl(): Promise<string | null> {
  const launch = await App.getLaunchUrl();
  return launch?.url ?? null;
}

export function exitApp(): void {
  void App.exitApp();
}
