import type { AppLocale, ThemeMode } from '@/shared/enums';

import { useSettingsStore } from '../store/settings.store';

export interface AppearancePreferences {
  readonly theme: ThemeMode;
  readonly locale: AppLocale;
}

/** Read-only appearance preferences for the app providers. */
export function useAppearancePreferences(): AppearancePreferences {
  const theme = useSettingsStore((state) => state.theme);
  const locale = useSettingsStore((state) => state.locale);
  return { theme, locale };
}
