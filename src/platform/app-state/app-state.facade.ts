import { subscribeToAppStateChange } from '@/packages/capacitor-app';

export interface AppLifecycleCallbacks {
  readonly onForeground?: () => void;
  readonly onBackground?: () => void;
}

/** Subscribe to app foreground/background transitions with cleanup. */
export function subscribeToAppLifecycle(callbacks: AppLifecycleCallbacks): () => void {
  return subscribeToAppStateChange((isActive) => {
    if (isActive) {
      callbacks.onForeground?.();
      return;
    }
    callbacks.onBackground?.();
  });
}
