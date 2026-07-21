import { TEST_IDS } from '@/shared/config';

/** The five designed async states this screen can present. */
export const LINK_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.notificationLinkLoading,
  errorTestId: TEST_IDS.notificationLinkError,
  offlineTestId: TEST_IDS.notificationLinkOffline,
  forbiddenTestId: TEST_IDS.notificationLinkForbidden,
  emptyTestId: TEST_IDS.notificationLinkEmpty,
} as const;
