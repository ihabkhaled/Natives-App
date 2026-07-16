import { THEME_MODE, type ThemeMode } from '@/shared/enums';

/** Resolve the effective dark-mode flag from preference + system signal. */
export function selectIsDarkTheme(theme: ThemeMode, systemPrefersDark: boolean): boolean {
  if (theme === THEME_MODE.Dark) {
    return true;
  }
  if (theme === THEME_MODE.Light) {
    return false;
  }
  return systemPrefersDark;
}
