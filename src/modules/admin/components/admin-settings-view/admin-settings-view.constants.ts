import { TEST_IDS } from '@/shared/config';

/** The five designed async states the settings screen can present. */
export const SETTINGS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.adminSettingsLoading,
  errorTestId: TEST_IDS.adminSettingsError,
  offlineTestId: TEST_IDS.adminSettingsOffline,
  forbiddenTestId: TEST_IDS.adminSettingsForbidden,
  emptyTestId: TEST_IDS.adminSettingsEmpty,
} as const;
