import { TEST_IDS } from '@/shared/config';

/** The state test ids the shared AsyncStateView stamps on this screen. */
export const JERSEY_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.jerseyLoading,
  errorTestId: TEST_IDS.jerseyError,
  offlineTestId: TEST_IDS.jerseyOffline,
  forbiddenTestId: TEST_IDS.jerseyForbidden,
  emptyTestId: TEST_IDS.jerseyEmpty,
} as const;
