import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import type { InitI18nOptions } from './i18n.types';

export async function initI18n(options: InitI18nOptions): Promise<void> {
  if (i18next.isInitialized) {
    return;
  }
  await i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: options.resources,
      fallbackLng: options.defaultLocale,
      supportedLngs: [...options.supportedLocales],
      nonExplicitSupportedLngs: true,
      detection: {
        order: ['querystring', 'navigator'],
        caches: [],
      },
      interpolation: {
        escapeValue: false,
      },
      returnNull: false,
    });
}

export function getActiveLocale(): string {
  return i18next.resolvedLanguage ?? i18next.language;
}

export async function changeAppLocale(locale: string): Promise<void> {
  await i18next.changeLanguage(locale);
}

export function translateNow(key: string): string {
  return i18next.t(key);
}
