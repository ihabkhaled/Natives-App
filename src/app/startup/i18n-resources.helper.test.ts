import { describe, expect, it } from 'vitest';

import { APP_LOCALE } from '@/shared/enums';
import { I18N_KEYS } from '@/shared/i18n';

import { buildI18nResources } from './i18n-resources.helper';

describe('buildI18nResources', () => {
  it('bundles exactly the supported locales', () => {
    expect(Object.keys(buildI18nResources()).sort()).toEqual(['ar', 'en']);
  });

  it('nests each catalog under the i18next translation namespace', () => {
    const resources = buildI18nResources();

    expect(resources[APP_LOCALE.English]?.translation).toBeTypeOf('object');
    expect(resources[APP_LOCALE.Arabic]?.translation).toBeTypeOf('object');
  });

  it('carries the English copy the app renders', () => {
    const english = buildI18nResources()[APP_LOCALE.English]?.translation;

    expect(english).toMatchObject({ common: { appName: 'Capacitor Ranger' } });
  });

  it('carries a translated Arabic catalog rather than a copy of English', () => {
    const resources = buildI18nResources();

    expect(resources[APP_LOCALE.Arabic]?.translation).not.toEqual(
      resources[APP_LOCALE.English]?.translation,
    );
  });

  it('keeps both catalogs structurally identical, so no key falls back', () => {
    const resources = buildI18nResources();

    expect(Object.keys(resources[APP_LOCALE.Arabic]?.translation ?? {}).sort()).toEqual(
      Object.keys(resources[APP_LOCALE.English]?.translation ?? {}).sort(),
    );
  });

  it('resolves a declared key in both catalogs', () => {
    const resources = buildI18nResources();
    const [namespace, key] = I18N_KEYS.common.loading.split('.') as [string, string];

    for (const locale of [APP_LOCALE.English, APP_LOCALE.Arabic]) {
      const section = resources[locale]?.translation[namespace] as Record<string, string>;
      expect(section[key]).toBeTypeOf('string');
    }
  });
});
