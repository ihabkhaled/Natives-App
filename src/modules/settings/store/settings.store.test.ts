import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '@/shared/config';
import { APP_LOCALE, THEME_MODE } from '@/shared/enums';

import { useSettingsStore } from './settings.store';

/** Capacitor Preferences prefixes every web key with its storage group. */
const PERSISTED_KEY = `CapacitorStorage.${STORAGE_KEYS.settings}`;

interface PersistedEnvelope {
  readonly state: Record<string, unknown>;
  readonly version: number;
}

/** Let the async Preferences adapter finish its write. */
function flushStorageWork(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function readPersisted(): PersistedEnvelope {
  const raw = localStorage.getItem(PERSISTED_KEY);
  expect(raw).not.toBeNull();
  return JSON.parse(raw!) as PersistedEnvelope;
}

function seedPersisted(state: Record<string, unknown>, version = 1): void {
  localStorage.setItem(PERSISTED_KEY, JSON.stringify({ state, version }));
}

async function importFreshStore(): Promise<typeof useSettingsStore> {
  vi.resetModules();
  const module = await import('./settings.store');
  return module.useSettingsStore;
}

/** Re-read the store's defaults against a patched build environment. */
async function importStoreWithEnv(
  overrides: Readonly<Record<string, string>>,
): Promise<typeof useSettingsStore> {
  for (const [key, value] of Object.entries(overrides)) {
    vi.stubEnv(key, value);
  }
  return importFreshStore();
}

beforeEach(async () => {
  useSettingsStore.setState({ theme: THEME_MODE.System, locale: APP_LOCALE.English });
  await flushStorageWork();
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('useSettingsStore', () => {
  it('starts from the environment defaults declared in .env.test', () => {
    expect(useSettingsStore.getInitialState()).toMatchObject({
      theme: THEME_MODE.System,
      locale: APP_LOCALE.English,
    });
  });

  it('updates the theme', () => {
    useSettingsStore.getState().setTheme(THEME_MODE.Dark);

    expect(useSettingsStore.getState().theme).toBe(THEME_MODE.Dark);
  });

  it('updates the locale', () => {
    useSettingsStore.getState().setLocale(APP_LOCALE.Arabic);

    expect(useSettingsStore.getState().locale).toBe(APP_LOCALE.Arabic);
  });

  it('changes one preference without disturbing the other', () => {
    useSettingsStore.getState().setLocale(APP_LOCALE.Arabic);
    useSettingsStore.getState().setTheme(THEME_MODE.Light);

    expect(useSettingsStore.getState()).toMatchObject({
      theme: THEME_MODE.Light,
      locale: APP_LOCALE.Arabic,
    });
  });

  it('persists a theme change through the platform storage adapter', async () => {
    useSettingsStore.getState().setTheme(THEME_MODE.Dark);

    await vi.waitFor(() => {
      expect(readPersisted().state).toMatchObject({ theme: THEME_MODE.Dark });
    });
    expect(readPersisted().version).toBe(1);
  });

  it('persists a locale change through the platform storage adapter', async () => {
    useSettingsStore.getState().setLocale(APP_LOCALE.Arabic);

    await vi.waitFor(() => {
      expect(readPersisted().state).toMatchObject({ locale: APP_LOCALE.Arabic });
    });
  });

  it('persists preferences only: never the actions, never anything else', async () => {
    useSettingsStore.getState().setTheme(THEME_MODE.Dark);

    await vi.waitFor(() => {
      expect(localStorage.getItem(PERSISTED_KEY)).not.toBeNull();
    });
    expect(Object.keys(readPersisted().state).sort()).toEqual(['locale', 'theme']);
    expect(localStorage.getItem(PERSISTED_KEY)).not.toContain('setTheme');
  });

  it('rehydrates a previously persisted payload on startup', async () => {
    seedPersisted({ theme: THEME_MODE.Dark, locale: APP_LOCALE.Arabic });

    const store = await importFreshStore();

    await vi.waitFor(() => {
      expect(store.getState()).toMatchObject({
        theme: THEME_MODE.Dark,
        locale: APP_LOCALE.Arabic,
      });
    });
  });

  it('keeps the actions callable after rehydration', async () => {
    seedPersisted({ theme: THEME_MODE.Dark, locale: APP_LOCALE.Arabic });

    const store = await importFreshStore();
    await vi.waitFor(() => {
      expect(store.getState().theme).toBe(THEME_MODE.Dark);
    });
    store.getState().setTheme(THEME_MODE.Light);

    expect(store.getState().theme).toBe(THEME_MODE.Light);
  });

  it('falls back to the defaults when the persisted payload came from a newer version', async () => {
    seedPersisted({ theme: THEME_MODE.Dark, locale: APP_LOCALE.Arabic }, 99);

    const store = await importFreshStore();
    await flushStorageWork();

    expect(store.getState()).toMatchObject({
      theme: THEME_MODE.System,
      locale: APP_LOCALE.English,
    });
  });

  it('falls back to the defaults when an older persisted payload is corrupted', async () => {
    seedPersisted({ theme: 'midnight', locale: 'fr' }, 0);

    const store = await importFreshStore();
    await flushStorageWork();

    expect(store.getState()).toMatchObject({
      theme: THEME_MODE.System,
      locale: APP_LOCALE.English,
    });
  });

  it('starts from the defaults when nothing was ever persisted', async () => {
    const store = await importFreshStore();
    await flushStorageWork();

    expect(store.getState()).toMatchObject({
      theme: THEME_MODE.System,
      locale: APP_LOCALE.English,
    });
  });

  it('exposes preferences and their setters only', () => {
    expect(Object.keys(useSettingsStore.getState()).sort()).toEqual([
      'locale',
      'setLocale',
      'setTheme',
      'theme',
    ]);
  });

  describe('defaults resolved from the build environment', () => {
    it('adopts a dark default theme', async () => {
      const store = await importStoreWithEnv({ VITE_DEFAULT_THEME: THEME_MODE.Dark });

      expect(store.getInitialState().theme).toBe(THEME_MODE.Dark);
    });

    it('adopts a light default theme', async () => {
      const store = await importStoreWithEnv({ VITE_DEFAULT_THEME: THEME_MODE.Light });

      expect(store.getInitialState().theme).toBe(THEME_MODE.Light);
    });

    it('adopts an Arabic default locale', async () => {
      const store = await importStoreWithEnv({ VITE_DEFAULT_LOCALE: APP_LOCALE.Arabic });

      expect(store.getInitialState().locale).toBe(APP_LOCALE.Arabic);
    });

    it('migrates a newer payload onto the environment defaults, not hardcoded ones', async () => {
      seedPersisted({ theme: THEME_MODE.System, locale: APP_LOCALE.English }, 99);

      const store = await importStoreWithEnv({
        VITE_DEFAULT_THEME: THEME_MODE.Dark,
        VITE_DEFAULT_LOCALE: APP_LOCALE.Arabic,
      });
      await flushStorageWork();

      expect(store.getState()).toMatchObject({
        theme: THEME_MODE.Dark,
        locale: APP_LOCALE.Arabic,
      });
    });
  });
});
