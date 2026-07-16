import { create, type StateCreator, type UseBoundStore, type StoreApi } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { PersistedStoreOptions } from './state.interfaces';

export type AppStore<State> = UseBoundStore<StoreApi<State>>;

/** Create an in-memory client-state store. */
export function createAppStore<State>(initializer: StateCreator<State>): AppStore<State> {
  return create<State>(initializer);
}

/**
 * Create a persisted client-state store. Persisted payloads are versioned,
 * migrated, and stored through the injected platform storage adapter.
 * Never persist secrets or server state here (rules/14, rules/15).
 */
export function createPersistedAppStore<State>(
  initializer: StateCreator<State>,
  options: PersistedStoreOptions<State>,
): AppStore<State> {
  return create<State>()(
    persist(initializer, {
      name: options.storageKey,
      version: options.version,
      storage: createJSONStorage(() => options.storage),
      migrate: (persisted, fromVersion) => options.migrate(persisted, fromVersion),
      ...(options.partialize === undefined ? {} : { partialize: options.partialize }),
    }),
  );
}
