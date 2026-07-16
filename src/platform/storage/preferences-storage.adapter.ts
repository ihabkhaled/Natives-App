import {
  getPreferenceValue,
  removePreferenceValue,
  setPreferenceValue,
} from '@/packages/capacitor-preferences';
import type { StateStorageAdapter } from '@/packages/state';

/**
 * Bridge Capacitor Preferences into the persisted-store contract.
 * Non-sensitive data only; tokens use the secure-storage owner.
 */
export function createPreferencesStorageAdapter(): StateStorageAdapter {
  return {
    getItem: (name) => getPreferenceValue(name),
    setItem: (name, value) => setPreferenceValue(name, value),
    removeItem: (name) => removePreferenceValue(name),
  };
}
