import { APP_LOCALE, THEME_MODE } from '@/shared/enums';

/**
 * Presentational settings view fields (everything except the change handlers)
 * shared by the settings component and container suites so neither carries a
 * byte-identical view-model literal (jscpd threshold is zero).
 */
export const SAMPLE_SETTINGS_PRESENTATION = {
  title: 'Settings',
  appearanceLabel: 'Appearance',
  themeLabel: 'Theme',
  themeChoices: [
    { value: THEME_MODE.Light, label: 'Light' },
    { value: THEME_MODE.Dark, label: 'Dark' },
    { value: THEME_MODE.System, label: 'System' },
  ],
  theme: THEME_MODE.System,
  languageLabel: 'Language',
  localeChoices: [
    { value: APP_LOCALE.English, label: 'English' },
    { value: APP_LOCALE.Arabic, label: 'العربية' },
  ],
  locale: APP_LOCALE.English,
  connectivityLabel: 'Connectivity',
  networkStatusText: 'Online',
  isOnline: true,
  apiModeLabel: 'API mode',
  apiModeText: 'Mock (MSW)',
  runtimeLabel: 'Runtime',
  platformLabel: 'Platform',
  platformText: 'web · Web',
};
