import { useAppLifecycle } from './use-app-lifecycle.hook';

/** Null-rendering provider that owns native lifecycle listeners. */
export function AppLifecycle(): null {
  useAppLifecycle();
  return null;
}
