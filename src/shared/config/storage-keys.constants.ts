/**
 * Every persisted key in the application, in one place.
 * Raw storage keys are forbidden everywhere else (ESLint:
 * architecture/no-inline-storage-keys).
 */
export const STORAGE_KEYS = {
  settings: 'capacitor-ranger.settings.v1',
  authAccessToken: 'capacitor-ranger.auth.access-token',
  authRefreshToken: 'capacitor-ranger.auth.refresh-token',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
