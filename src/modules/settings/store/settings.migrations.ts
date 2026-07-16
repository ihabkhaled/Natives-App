import { safeParseWithSchema } from '@/packages/schema';
import type { AppLocale, ThemeMode } from '@/shared/enums';

import { persistedSettingsSchema } from './settings.schema';

export interface PersistedSettings {
  readonly theme: ThemeMode;
  readonly locale: AppLocale;
}

export const SETTINGS_STORE_VERSION = 1;

/**
 * Versioned migration for the persisted settings payload. Unknown or
 * corrupted payloads fall back to the provided defaults instead of
 * crashing startup.
 */
export function migratePersistedSettings(
  persisted: unknown,
  fromVersion: number,
  defaults: PersistedSettings,
): PersistedSettings {
  if (fromVersion > SETTINGS_STORE_VERSION) {
    return defaults;
  }
  const parsed = safeParseWithSchema(persistedSettingsSchema, persisted);
  if (!parsed.success) {
    return defaults;
  }
  return parsed.data;
}
