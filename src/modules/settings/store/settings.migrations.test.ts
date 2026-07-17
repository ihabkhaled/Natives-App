import { describe, expect, it } from 'vitest';

import { APP_LOCALE, THEME_MODE } from '@/shared/enums';

import {
  migratePersistedSettings,
  SETTINGS_STORE_VERSION,
  type PersistedSettings,
} from './settings.migrations';

const DEFAULTS: PersistedSettings = { theme: THEME_MODE.System, locale: APP_LOCALE.English };
const STORED: PersistedSettings = { theme: THEME_MODE.Dark, locale: APP_LOCALE.Arabic };

describe('SETTINGS_STORE_VERSION', () => {
  it('is the current persisted payload version', () => {
    expect(SETTINGS_STORE_VERSION).toBe(1);
  });
});

describe('migratePersistedSettings', () => {
  it('passes a valid payload of the current version through untouched', () => {
    expect(migratePersistedSettings(STORED, SETTINGS_STORE_VERSION, DEFAULTS)).toEqual(STORED);
  });

  it('accepts a valid payload written by an older version', () => {
    expect(migratePersistedSettings(STORED, 0, DEFAULTS)).toEqual(STORED);
  });

  it('falls back to defaults when the payload came from a newer version', () => {
    expect(migratePersistedSettings(STORED, SETTINGS_STORE_VERSION + 1, DEFAULTS)).toEqual(
      DEFAULTS,
    );
  });

  it('ignores a newer payload even when it would otherwise validate', () => {
    const result = migratePersistedSettings(STORED, 99, DEFAULTS);

    expect(result).toBe(DEFAULTS);
  });

  it('falls back to defaults when the payload is corrupted', () => {
    expect(
      migratePersistedSettings(
        { theme: 'midnight', locale: 'en' },
        SETTINGS_STORE_VERSION,
        DEFAULTS,
      ),
    ).toEqual(DEFAULTS);
  });

  it('falls back to defaults when the payload is not an object', () => {
    expect(migratePersistedSettings('dark', SETTINGS_STORE_VERSION, DEFAULTS)).toEqual(DEFAULTS);
    expect(migratePersistedSettings(null, SETTINGS_STORE_VERSION, DEFAULTS)).toEqual(DEFAULTS);
    expect(migratePersistedSettings(undefined, SETTINGS_STORE_VERSION, DEFAULTS)).toEqual(DEFAULTS);
  });

  it('falls back to defaults when a field is missing', () => {
    expect(
      migratePersistedSettings({ theme: THEME_MODE.Dark }, SETTINGS_STORE_VERSION, DEFAULTS),
    ).toEqual(DEFAULTS);
  });

  it('never crashes startup on a hostile payload', () => {
    expect(() =>
      migratePersistedSettings({ theme: { toString: null } }, SETTINGS_STORE_VERSION, DEFAULTS),
    ).not.toThrow();
  });

  it('drops unknown keys from an otherwise valid payload', () => {
    const result = migratePersistedSettings(
      { ...STORED, accessToken: 'leaked' },
      SETTINGS_STORE_VERSION,
      DEFAULTS,
    );

    expect(result).toEqual(STORED);
    expect(Object.keys(result)).toEqual(['theme', 'locale']);
  });

  it('returns whichever defaults the caller supplies', () => {
    const alternate: PersistedSettings = { theme: THEME_MODE.Light, locale: APP_LOCALE.Arabic };

    expect(migratePersistedSettings('junk', SETTINGS_STORE_VERSION, alternate)).toEqual(alternate);
  });
});
