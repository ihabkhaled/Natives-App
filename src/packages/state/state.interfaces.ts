export interface StateStorageAdapter {
  readonly getItem: (name: string) => Promise<string | null>;
  readonly setItem: (name: string, value: string) => Promise<void>;
  readonly removeItem: (name: string) => Promise<void>;
}

export interface PersistedStoreOptions<State> {
  readonly storageKey: string;
  readonly version: number;
  readonly storage: StateStorageAdapter;
  readonly migrate: (persisted: unknown, fromVersion: number) => State;
  readonly partialize?: (state: State) => Partial<State>;
}
