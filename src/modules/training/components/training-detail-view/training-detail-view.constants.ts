import { TEST_IDS } from '@/shared/config';

/** The five designed states the detail screen can present. */
export const TRAINING_DETAIL_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.trainingLoading,
  errorTestId: TEST_IDS.trainingError,
  offlineTestId: TEST_IDS.trainingOffline,
  forbiddenTestId: TEST_IDS.trainingForbidden,
  emptyTestId: TEST_IDS.trainingEmpty,
} as const;
