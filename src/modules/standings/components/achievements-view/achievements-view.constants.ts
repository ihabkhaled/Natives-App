import { TEST_IDS } from '@/shared/config';

/** The five designed states the achievements workspace can present. */
export const ACHIEVEMENTS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.achievementsLoading,
  errorTestId: TEST_IDS.achievementsError,
  offlineTestId: TEST_IDS.achievementsOffline,
  forbiddenTestId: TEST_IDS.achievementsForbidden,
  emptyTestId: TEST_IDS.achievementsEmpty,
} as const;
