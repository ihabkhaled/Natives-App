import { useAppLifecycle } from './use-app-lifecycle.hook';
import { usePwaLifecycle } from './use-pwa-lifecycle.hook';

/** Null-rendering provider that owns native and PWA lifecycle listeners. */
export function AppLifecycle(): null {
  useAppLifecycle();
  usePwaLifecycle();
  return null;
}
