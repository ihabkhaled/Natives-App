import { changeAppLocale } from '@/packages/i18n';
import { APP_LOCALE, type AppLocale } from '@/shared/enums';

import { useSettingsStore } from '../store/settings.store';

export interface LocaleToggleView {
  /** The locale currently stored and applied to the document. */
  readonly locale: AppLocale;
  /** Convenience flag: `true` once the stored locale is Arabic (RTL). */
  readonly isArabic: boolean;
  /** Flip between English and Arabic, persisting the choice and re-applying i18n + direction. */
  readonly toggle: () => void;
}

/**
 * One-tap language switch for the public navbar. Only English and Arabic are
 * supported today, so the toggle is a simple flip rather than a picker; a
 * third locale would replace this with the same choice list the settings
 * screen already uses.
 */
export function useLocaleToggle(): LocaleToggleView {
  const locale = useSettingsStore((state) => state.locale);
  const setLocale = useSettingsStore((state) => state.setLocale);
  const isArabic = locale === APP_LOCALE.Arabic;
  return {
    locale,
    isArabic,
    toggle: () => {
      const next = isArabic ? APP_LOCALE.English : APP_LOCALE.Arabic;
      setLocale(next);
      void changeAppLocale(next);
    },
  };
}
