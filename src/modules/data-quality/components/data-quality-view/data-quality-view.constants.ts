import { TEST_IDS } from '@/shared/config';

/** The state test ids the shared AsyncStateView stamps on this screen. */
export const DATA_QUALITY_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.dataQualityLoading,
  errorTestId: TEST_IDS.dataQualityError,
  offlineTestId: TEST_IDS.dataQualityOffline,
  forbiddenTestId: TEST_IDS.dataQualityForbidden,
  emptyTestId: TEST_IDS.dataQualityEmpty,
} as const;
