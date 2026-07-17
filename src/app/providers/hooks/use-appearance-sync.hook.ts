import { useEffect, useState } from 'react';

import { changeAppLocale, getActiveLocale, localeToDirection } from '@/packages/i18n';
import { selectIsDarkTheme, useAppearancePreferences } from '@/modules/settings';
import {
  applyDocumentLocale,
  applyDocumentTheme,
  applyNativeChrome,
  getSystemPrefersDark,
  subscribeToSystemTheme,
} from '@/platform';

/**
 * Applies theme, locale, direction, and native chrome whenever the
 * persisted preferences or the system color scheme change.
 */
export function useAppearanceSync(): void {
  const { theme, locale } = useAppearancePreferences();
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => getSystemPrefersDark());
  useEffect(() => subscribeToSystemTheme(setSystemPrefersDark), []);
  const isDarkTheme = selectIsDarkTheme(theme, systemPrefersDark);
  useEffect(() => {
    applyDocumentTheme(isDarkTheme);
    void applyNativeChrome({ isDarkTheme });
  }, [isDarkTheme]);
  useEffect(() => {
    applyDocumentLocale(locale, localeToDirection(locale));
    if (getActiveLocale() !== locale) {
      void changeAppLocale(locale);
    }
  }, [locale]);
}
