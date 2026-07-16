import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';
import { APP_LOCALE, APP_LOCALES, THEME_MODE, THEME_MODES } from '@/shared/enums';

import { persistedSettingsSchema } from './settings.schema';

function parse(value: unknown): ReturnType<typeof safeParseWithSchema> {
  return safeParseWithSchema(persistedSettingsSchema, value);
}

function pathsOf(value: unknown): readonly string[] {
  const result = parse(value);
  expect(result.success).toBe(false);
  return result.success ? [] : result.issues.map((issue) => issue.path);
}

describe('persistedSettingsSchema', () => {
  it('accepts a well-formed persisted payload', () => {
    expect(parse({ theme: THEME_MODE.Dark, locale: APP_LOCALE.Arabic })).toEqual({
      success: true,
      data: { theme: 'dark', locale: 'ar' },
    });
  });

  it('accepts every theme mode the app can persist', () => {
    for (const theme of THEME_MODES) {
      expect(parse({ theme, locale: APP_LOCALE.English }).success).toBe(true);
    }
  });

  it('accepts every locale the app can persist', () => {
    for (const locale of APP_LOCALES) {
      expect(parse({ theme: THEME_MODE.System, locale }).success).toBe(true);
    }
  });

  it('rejects an unknown theme', () => {
    expect(pathsOf({ theme: 'midnight', locale: APP_LOCALE.English })).toEqual(['theme']);
  });

  it('rejects an unknown locale', () => {
    expect(pathsOf({ theme: THEME_MODE.Light, locale: 'fr' })).toEqual(['locale']);
  });

  it('rejects a payload missing the theme', () => {
    expect(pathsOf({ locale: APP_LOCALE.English })).toEqual(['theme']);
  });

  it('rejects a payload missing the locale', () => {
    expect(pathsOf({ theme: THEME_MODE.Light })).toEqual(['locale']);
  });

  it('rejects non-object payloads', () => {
    expect(parse(null).success).toBe(false);
    expect(parse('dark').success).toBe(false);
    expect(parse(undefined).success).toBe(false);
  });

  it('reports both fields when both are wrong', () => {
    expect(pathsOf({ theme: 1, locale: 2 })).toEqual(['theme', 'locale']);
  });

  it('strips unknown keys so stale payloads never widen the contract', () => {
    const result = parse({ theme: THEME_MODE.Light, locale: APP_LOCALE.English, token: 'secret' });

    expect(result).toEqual({ success: true, data: { theme: 'light', locale: 'en' } });
  });
});
