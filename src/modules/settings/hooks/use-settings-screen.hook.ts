import { changeAppLocale, useAppTranslation } from '@/packages/i18n';
import { getExecutionContext, useNetworkStatus } from '@/platform';
import { API_MODE, APP_LOCALE, THEME_MODE, type AppLocale, type ThemeMode } from '@/shared/enums';
import { I18N_KEYS } from '@/shared/i18n';

import { useSettingsStore } from '../store/settings.store';
import { useRuntimeInfo } from './use-runtime-info.hook';

interface SettingsChoice<Value extends string> {
  readonly value: Value;
  readonly label: string;
}

export interface SettingsScreenView {
  readonly title: string;
  readonly appearanceLabel: string;
  readonly themeLabel: string;
  readonly themeChoices: readonly SettingsChoice<ThemeMode>[];
  readonly theme: ThemeMode;
  readonly onThemeChange: (theme: ThemeMode) => void;
  readonly languageLabel: string;
  readonly localeChoices: readonly SettingsChoice<AppLocale>[];
  readonly locale: AppLocale;
  readonly onLocaleChange: (locale: AppLocale) => void;
  readonly connectivityLabel: string;
  readonly networkStatusText: string;
  readonly isOnline: boolean;
  readonly apiModeLabel: string;
  readonly apiModeText: string;
  readonly runtimeLabel: string;
  readonly platformLabel: string;
  readonly platformText: string;
}

/** Prepared, translated view model for the settings screen. */
export function useSettingsScreen(): SettingsScreenView {
  const { t } = useAppTranslation();
  const theme = useSettingsStore((state) => state.theme);
  const locale = useSettingsStore((state) => state.locale);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const setLocale = useSettingsStore((state) => state.setLocale);
  const network = useNetworkStatus();
  const runtime = useRuntimeInfo();
  const executionContext = getExecutionContext();
  return {
    title: t(I18N_KEYS.settings.title),
    appearanceLabel: t(I18N_KEYS.settings.appearance),
    themeLabel: t(I18N_KEYS.settings.theme),
    themeChoices: [
      { value: THEME_MODE.Light, label: t(I18N_KEYS.settings.themeLight) },
      { value: THEME_MODE.Dark, label: t(I18N_KEYS.settings.themeDark) },
      { value: THEME_MODE.System, label: t(I18N_KEYS.settings.themeSystem) },
    ],
    theme,
    onThemeChange: setTheme,
    languageLabel: t(I18N_KEYS.settings.language),
    localeChoices: [
      { value: APP_LOCALE.English, label: t(I18N_KEYS.settings.languageEnglish) },
      { value: APP_LOCALE.Arabic, label: t(I18N_KEYS.settings.languageArabic) },
    ],
    locale,
    onLocaleChange: (nextLocale) => {
      setLocale(nextLocale);
      void changeAppLocale(nextLocale);
    },
    connectivityLabel: t(I18N_KEYS.settings.connectivity),
    networkStatusText: network.isOnline
      ? t(I18N_KEYS.settings.networkOnline)
      : t(I18N_KEYS.settings.networkOffline),
    isOnline: network.isOnline,
    apiModeLabel: t(I18N_KEYS.settings.apiMode),
    apiModeText:
      executionContext.apiMode === API_MODE.Mock
        ? t(I18N_KEYS.settings.apiModeMock)
        : t(I18N_KEYS.settings.apiModeRemote),
    runtimeLabel: t(I18N_KEYS.settings.runtime),
    platformLabel: t(I18N_KEYS.settings.runtimePlatform),
    platformText:
      runtime.device === undefined
        ? ''
        : `${runtime.device.platform} · ${
            runtime.device.isNative
              ? t(I18N_KEYS.settings.runtimeNative)
              : t(I18N_KEYS.settings.runtimeWeb)
          }`,
  };
}
