import { TEST_IDS } from '@/shared/config';

/** The five designed async states this screen can present. */
export const PREFS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.notificationPrefsLoading,
  errorTestId: TEST_IDS.notificationPrefsError,
  offlineTestId: TEST_IDS.notificationPrefsOffline,
  forbiddenTestId: TEST_IDS.notificationPrefsForbidden,
  emptyTestId: TEST_IDS.notificationPrefsEmpty,
} as const;
