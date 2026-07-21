import { vi } from 'vitest';

/**
 * The Preferences storage adapter, stubbed.
 *
 * Any test that partially mocks `@/platform` still has to provide one: the
 * auth module's persisted active-team store reaches for it at import time, so a
 * partial mock without it fails the whole module graph rather than one
 * assertion.
 */
export function createStorageAdapterStub() {
  return {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
  };
}

/** The whole `@/platform` surface a screen test needs, mocked in one place. */
export function createPlatformMock() {
  return {
    useNetworkStatus: vi.fn(),
    createPreferencesStorageAdapter: createStorageAdapterStub,
  };
}
