import { initI18n } from '@/packages/i18n';

import arCatalog from '@/shared/i18n/locales/ar.json';
import enCatalog from '@/shared/i18n/locales/en.json';

/** Initialize the real i18n stack once for a test file (idempotent). */
export async function initTestI18n(): Promise<void> {
  await initI18n({
    resources: {
      en: { translation: enCatalog },
      ar: { translation: arCatalog },
    },
    defaultLocale: 'en',
    supportedLocales: ['en', 'ar'],
  });
}
