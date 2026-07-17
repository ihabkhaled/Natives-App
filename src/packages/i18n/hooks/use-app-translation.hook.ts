import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { AppTranslation, TranslateParams } from '../i18n.types';

/**
 * The single owner of react-i18next hook access. Feature hooks compose
 * this instead of importing react-i18next directly.
 *
 * The returned `t` is referentially stable for a given language, so callers
 * can legitimately use it as a dependency. Returning a fresh arrow each
 * render would silently defeat every `useMemo(..., [t])` downstream.
 */
export function useAppTranslation(): AppTranslation {
  const { t, i18n } = useTranslation();
  const translate = useCallback(
    (key: string, params?: TranslateParams) => (params === undefined ? t(key) : t(key, params)),
    [t],
  );
  const locale = i18n.resolvedLanguage ?? i18n.language;
  return useMemo(() => ({ t: translate, locale }), [translate, locale]);
}
