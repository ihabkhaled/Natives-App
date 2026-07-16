import { useTranslation } from 'react-i18next';

import type { AppTranslation, TranslateParams } from '../i18n.types';

/**
 * The single owner of react-i18next hook access. Feature hooks compose
 * this instead of importing react-i18next directly.
 */
export function useAppTranslation(): AppTranslation {
  const { t, i18n } = useTranslation();
  return {
    t: (key: string, params?: TranslateParams) =>
      params === undefined ? t(key) : t(key, params),
    locale: i18n.resolvedLanguage ?? i18n.language,
  };
}
