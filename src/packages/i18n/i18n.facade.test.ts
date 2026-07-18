import { beforeAll, describe, expect, it } from 'vitest';

import { initTestI18n } from '../../../tests/setup/i18n-test.helper';
import { changeAppLocale, getActiveLocale, initI18n, translateNow } from './i18n.facade';

beforeAll(async () => {
  await initTestI18n();
});

describe('initI18n', () => {
  it('initializes the shared instance with the requested locale', () => {
    expect(getActiveLocale()).toBe('en');
    expect(translateNow('common.appName')).toBe('Ultimate Natives');
  });

  it('returns early on a second call instead of re-initializing', async () => {
    await initI18n({
      resources: { zz: { translation: { common: { appName: 'Overwritten' } } } },
      defaultLocale: 'zz',
      supportedLocales: ['zz'],
    });

    expect(getActiveLocale()).toBe('en');
    expect(translateNow('common.appName')).toBe('Ultimate Natives');
  });
});

describe('changeAppLocale', () => {
  it('switches the active locale and the resolved catalog', async () => {
    await changeAppLocale('ar');

    expect(getActiveLocale()).toBe('ar');
    expect(translateNow('common.appName')).toBe('ألتيميت ناتيفز');

    await changeAppLocale('en');

    expect(getActiveLocale()).toBe('en');
    expect(translateNow('common.appName')).toBe('Ultimate Natives');
  });

  it('resolves a regional locale down to its supported language', async () => {
    await changeAppLocale('ar-EG');

    expect(getActiveLocale()).toBe('ar');

    await changeAppLocale('en');
  });
});

describe('getActiveLocale', () => {
  it('falls back to the raw language when i18next resolves no catalog', async () => {
    // cimode is i18next's key-passthrough language: it never resolves a catalog.
    await changeAppLocale('cimode');

    expect(getActiveLocale()).toBe('cimode');
    expect(translateNow('common.appName')).toBe('common.appName');

    await changeAppLocale('en');
  });
});

describe('translateNow', () => {
  it('returns the key itself when it is missing from the catalog', () => {
    expect(translateNow('common.doesNotExist')).toBe('common.doesNotExist');
  });
});
