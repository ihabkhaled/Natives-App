import { useAppearanceSync } from './hooks/use-appearance-sync.hook';

/** Null-rendering provider that keeps document chrome in sync. */
export function AppearanceSync(): null {
  useAppearanceSync();
  return null;
}
