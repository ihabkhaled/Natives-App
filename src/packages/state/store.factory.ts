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
 *
 * `migrate` and `validate` are deliberately separate. zustand calls `migrate`
 * only when the stored version differs, so a payload corrupted or tampered
 * with at the *current* version would reach state unchecked. `validate` runs
 * on every rehydration to close that hole. It cannot simply re-run `migrate`:
 * a migration is a one-way upgrade and may not be idempotent, so applying it
 * twice would corrupt correct data.
 */
export function createPersistedAppStore<State>(
  initializer: StateCreator<State>,
  options: PersistedStoreOptions<State>,
): AppStore<State> {
  const { validate } = options;
  return create<State>()(
    persist(initializer, {
      name: options.storageKey,
      version: options.version,
      storage: createJSONStorage(() => options.storage),
      migrate: (persisted, fromVersion) => options.migrate(persisted, fromVersion),
      merge: (persisted, current) => ({
        ...current,
        ...(validate === undefined ? (persisted as Partial<State>) : validate(persisted)),
      }),
      ...(options.partialize === undefined ? {} : { partialize: options.partialize }),
    }),
  );
}
