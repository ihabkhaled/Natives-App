import { TEST_IDS } from '@/shared/config';

/** The five designed async states the platform panel can present. */
export const PLATFORM_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.adminPlatformLoading,
  errorTestId: TEST_IDS.adminPlatformError,
  offlineTestId: TEST_IDS.adminPlatformOffline,
  forbiddenTestId: TEST_IDS.adminPlatformForbidden,
  emptyTestId: TEST_IDS.adminPlatformEmpty,
} as const;
