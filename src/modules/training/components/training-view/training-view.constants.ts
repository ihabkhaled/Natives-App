import { TEST_IDS } from '@/shared/config';

/** The five designed states this screen can present, one test id each. */
export const TRAINING_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.trainingLoading,
  errorTestId: TEST_IDS.trainingError,
  offlineTestId: TEST_IDS.trainingOffline,
  forbiddenTestId: TEST_IDS.trainingForbidden,
  emptyTestId: TEST_IDS.trainingEmpty,
} as const;
