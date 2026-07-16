import { TEST_IDS } from '@/shared/config';

export const SETTINGS_VIEW_TEST_IDS = {
  themeSegment: TEST_IDS.settingsThemeSelect,
  localeSegment: TEST_IDS.settingsLocaleSelect,
  networkStatus: TEST_IDS.settingsNetworkStatus,
  apiMode: TEST_IDS.settingsApiMode,
  runtimePlatform: TEST_IDS.settingsRuntimePlatform,
} as const;
