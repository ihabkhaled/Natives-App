import { getSystemPrefersDark } from '@/platform';
import { THEME_MODE } from '@/shared/enums';

import { selectIsDarkTheme } from '../store/settings.selectors';
import { useSettingsStore } from '../store/settings.store';

export interface ThemeToggleView {
  /** The palette actually being rendered right now. */
  readonly isDark: boolean;
  /** Flip to the opposite explicit palette (never back to "system"). */
  readonly toggle: () => void;
}

/**
 * One-tap palette switch for the app bar. Reading the system signal here keeps
 * the toggle honest while the stored preference is still "system": the first
 * tap always moves away from whatever the user is currently looking at.
 */
export function useThemeToggle(): ThemeToggleView {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const isDark = selectIsDarkTheme(theme, getSystemPrefersDark());
  return {
    isDark,
    toggle: () => {
      setTheme(isDark ? THEME_MODE.Light : THEME_MODE.Dark);
    },
  };
}
