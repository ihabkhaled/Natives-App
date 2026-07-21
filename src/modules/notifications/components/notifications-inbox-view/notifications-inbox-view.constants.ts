import { TEST_IDS } from '@/shared/config';

/** The five designed async states this screen can present. */
export const INBOX_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.notificationsLoading,
  errorTestId: TEST_IDS.notificationsError,
  offlineTestId: TEST_IDS.notificationsOffline,
  forbiddenTestId: TEST_IDS.notificationsForbidden,
  emptyTestId: TEST_IDS.notificationsEmpty,
} as const;
