import { getEnvironment } from '@/packages/environment';
import { createPersistedAppStore } from '@/packages/state';
import { createPreferencesStorageAdapter } from '@/platform';
import { STORAGE_KEYS } from '@/shared/config';
import { APP_LOCALE, THEME_MODE, type AppLocale, type ThemeMode } from '@/shared/enums';

import {
  migratePersistedSettings,
  SETTINGS_STORE_VERSION,
  type PersistedSettings,
} from './settings.migrations';

export interface SettingsState {
  readonly theme: ThemeMode;
  readonly locale: AppLocale;
  readonly setTheme: (theme: ThemeMode) => void;
  readonly setLocale: (locale: AppLocale) => void;
}

function resolveDefaults(): PersistedSettings {
  const environment = getEnvironment();
  const theme =
    environment.defaultTheme === THEME_MODE.Light || environment.defaultTheme === THEME_MODE.Dark
      ? environment.defaultTheme
      : THEME_MODE.System;
  const locale =
    environment.defaultLocale === APP_LOCALE.Arabic ? APP_LOCALE.Arabic : APP_LOCALE.English;
  return { theme, locale };
}

/**
 * Client-global preferences: theme and locale. Persisted through the
 * platform Preferences adapter, schema-validated and versioned. Never
 * server state, never secrets (rules/14, rules/16, rules/18).
 */
export const useSettingsStore = createPersistedAppStore<SettingsState>(
  (set) => ({
    ...resolveDefaults(),
    setTheme: (theme) => {
      set({ theme });
    },
    setLocale: (locale) => {
      set({ locale });
    },
  }),
  {
    storageKey: STORAGE_KEYS.settings,
    version: SETTINGS_STORE_VERSION,
    storage: createPreferencesStorageAdapter(),
    migrate: (persisted, fromVersion) =>
      migratePersistedSettings(persisted, fromVersion, resolveDefaults()) as SettingsState,
    // Re-parsing at the current version is idempotent: a valid payload passes
    // through untouched, anything else degrades to defaults rather than
    // putting an unknown theme or locale into state.
    validate: (candidate) =>
      migratePersistedSettings(
        candidate,
        SETTINGS_STORE_VERSION,
        resolveDefaults(),
      ) as SettingsState,
    partialize: (state) => ({ theme: state.theme, locale: state.locale }),
  },
);
