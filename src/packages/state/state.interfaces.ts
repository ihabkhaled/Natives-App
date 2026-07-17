export interface StateStorageAdapter {
  readonly getItem: (name: string) => Promise<string | null>;
  readonly setItem: (name: string, value: string) => Promise<void>;
  readonly removeItem: (name: string) => Promise<void>;
}

export interface PersistedStoreOptions<State> {
  readonly storageKey: string;
  readonly version: number;
  readonly storage: StateStorageAdapter;
  /** One-way upgrade. Runs only when the stored version differs. */
  readonly migrate: (persisted: unknown, fromVersion: number) => State;
  /**
   * Schema guard. Runs on EVERY rehydration, after any migration, and must be
   * idempotent — it defends against a payload corrupted at the current version,
   * which zustand's migrate hook never sees.
   */
  readonly validate?: ((candidate: unknown) => State) | undefined;
  readonly partialize?: (state: State) => Partial<State>;
}
