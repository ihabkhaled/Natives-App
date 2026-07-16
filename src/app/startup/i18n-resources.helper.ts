import type { TranslationResources } from '@/packages/i18n';
import { APP_LOCALE } from '@/shared/enums';

import arCatalog from '@/shared/i18n/locales/ar.json';
import enCatalog from '@/shared/i18n/locales/en.json';

/** Bundle the canonical catalogs into i18next resources. */
export function buildI18nResources(): TranslationResources {
  return {
    [APP_LOCALE.English]: { translation: enCatalog },
    [APP_LOCALE.Arabic]: { translation: arCatalog },
  };
}
