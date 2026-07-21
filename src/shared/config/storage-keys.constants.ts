/**
 * Every persisted key in the application, in one place.
 * Raw storage keys are forbidden everywhere else (ESLint:
 * architecture/no-inline-storage-keys).
 */
export const STORAGE_KEYS = {
  settings: 'ultimate-natives.settings.v1',
  attendanceQueue: 'ultimate-natives.attendance-queue.v1',
  scorekeeperQueue: 'ultimate-natives.scorekeeper-queue.v1',
  authAccessToken: 'ultimate-natives.auth.access-token',
  authRefreshToken: 'ultimate-natives.auth.refresh-token',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
