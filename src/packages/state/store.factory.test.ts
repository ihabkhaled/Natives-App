import { describe, expect, it, vi } from 'vitest';

import type { StateStorageAdapter } from './state.interfaces';
import { createAppStore, createPersistedAppStore } from './store.factory';

interface CounterState {
  readonly count: number;
  readonly draft: string;
  readonly increment: () => void;
  readonly setDraft: (draft: string) => void;
}

interface MemoryStorage extends StateStorageAdapter {
  readonly read: (name: string) => string | null;
}

function createMemoryStorage(seed: Readonly<Record<string, string>> = {}): MemoryStorage {
  const entries = new Map<string, string>(Object.entries(seed));
  return {
    getItem: (name) => Promise.resolve(entries.get(name) ?? null),
    setItem: (name, value) => {
      entries.set(name, value);
      return Promise.resolve();
    },
    removeItem: (name) => {
      entries.delete(name);
      return Promise.resolve();
    },
    read: (name) => entries.get(name) ?? null,
  };
}

function counterInitializer(set: (partial: Partial<CounterState>) => void): CounterState {
  return {
    count: 0,
    draft: '',
    increment: () => {
      set({ count: 1 });
    },
    setDraft: (draft: string) => {
      set({ draft });
    },
  };
}

function readPersistedState(storage: MemoryStorage, key: string): Record<string, unknown> {
  const raw = storage.read(key);
  if (raw === null) {
    throw new Error(`nothing persisted under ${key}`);
  }
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null || !('state' in parsed)) {
    throw new TypeError('persisted payload is not a zustand envelope');
  }
  const { state } = parsed;
  if (typeof state !== 'object' || state === null) {
    throw new TypeError('persisted state is not an object');
  }
  return { ...state };
}

describe('createAppStore', () => {
  it('exposes the initial state', () => {
    const useStore = createAppStore<CounterState>((set) => counterInitializer(set));

    expect(useStore.getState().count).toBe(0);
    expect(useStore.getState().draft).toBe('');
  });

  it('applies state updates', () => {
    const useStore = createAppStore<CounterState>((set) => counterInitializer(set));

    useStore.getState().increment();
    useStore.getState().setDraft('hello');

    expect(useStore.getState().count).toBe(1);
    expect(useStore.getState().draft).toBe('hello');
  });

  it('notifies subscribers', () => {
    const useStore = createAppStore<CounterState>((set) => counterInitializer(set));
    const listener = vi.fn();
    const unsubscribe = useStore.subscribe(listener);

    useStore.getState().increment();
    unsubscribe();
    useStore.getState().setDraft('ignored');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('builds independent stores', () => {
    const first = createAppStore<CounterState>((set) => counterInitializer(set));
    const second = createAppStore<CounterState>((set) => counterInitializer(set));

    first.getState().increment();

    expect(second.getState().count).toBe(0);
  });
});

describe('createPersistedAppStore', () => {
  it('writes state changes through the storage adapter', async () => {
    const storage = createMemoryStorage();
    const useStore = createPersistedAppStore<CounterState>((set) => counterInitializer(set), {
      storageKey: 'counter',
      version: 1,
      storage,
      migrate: (persisted) => persisted as CounterState,
    });

    useStore.getState().setDraft('typed');

    await vi.waitFor(() => {
      expect(readPersistedState(storage, 'counter')).toEqual({ count: 0, draft: 'typed' });
    });
  });

  it('rehydrates from a stored payload of the same version', async () => {
    const storage = createMemoryStorage({
      counter: JSON.stringify({ state: { count: 7, draft: 'saved' }, version: 1 }),
    });
    const migrate = vi.fn((persisted: unknown) => persisted as CounterState);

    const useStore = createPersistedAppStore<CounterState>((set) => counterInitializer(set), {
      storageKey: 'counter',
      version: 1,
      storage,
      migrate,
    });

    await vi.waitFor(() => {
      expect(useStore.getState().count).toBe(7);
    });
    expect(useStore.getState().draft).toBe('saved');
    expect(migrate).not.toHaveBeenCalled();
  });

  it('migrates a payload written by an older version', async () => {
    const storage = createMemoryStorage({
      counter: JSON.stringify({ state: { count: 3 }, version: 0 }),
    });
    const migrate = vi.fn((persisted: unknown, fromVersion: number): CounterState => {
      const legacy = persisted as { count: number };
      return {
        count: legacy.count + fromVersion,
        draft: 'migrated',
        increment: () => undefined,
        setDraft: () => undefined,
      };
    });

    const useStore = createPersistedAppStore<CounterState>((set) => counterInitializer(set), {
      storageKey: 'counter',
      version: 1,
      storage,
      migrate,
    });

    await vi.waitFor(() => {
      expect(useStore.getState().draft).toBe('migrated');
    });
    expect(migrate).toHaveBeenCalledExactlyOnceWith({ count: 3 }, 0);
    expect(useStore.getState().count).toBe(3);
  });

  it('persists only the fields selected by partialize', async () => {
    const storage = createMemoryStorage();
    const useStore = createPersistedAppStore<CounterState>((set) => counterInitializer(set), {
      storageKey: 'counter',
      version: 1,
      storage,
      migrate: (persisted) => persisted as CounterState,
      partialize: (state) => ({ count: state.count }),
    });

    useStore.getState().increment();
    useStore.getState().setDraft('not-persisted');

    await vi.waitFor(() => {
      expect(readPersistedState(storage, 'counter')).toEqual({ count: 1 });
    });
    expect(useStore.getState().draft).toBe('not-persisted');
  });

  it('starts from the initializer when storage holds nothing', async () => {
    const storage = createMemoryStorage();
    const migrate = vi.fn((persisted: unknown) => persisted as CounterState);
    const useStore = createPersistedAppStore<CounterState>((set) => counterInitializer(set), {
      storageKey: 'counter',
      version: 1,
      storage,
      migrate,
    });

    expect(useStore.getState().count).toBe(0);

    useStore.getState().increment();

    await vi.waitFor(() => {
      expect(readPersistedState(storage, 'counter')).toEqual({ count: 1, draft: '' });
    });
    expect(migrate).not.toHaveBeenCalled();
  });
});
