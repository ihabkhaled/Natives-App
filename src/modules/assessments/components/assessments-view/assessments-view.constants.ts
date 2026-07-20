import { TEST_IDS } from '@/shared/config';

/** Virtualized list viewport height; the rows scroll inside the card. */
export const ASSESSMENTS_LIST_HEIGHT_PX = 460;

export const ASSESSMENTS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.assessmentsLoading,
  errorTestId: TEST_IDS.assessmentsError,
  offlineTestId: TEST_IDS.assessmentsOffline,
  forbiddenTestId: TEST_IDS.assessmentsForbidden,
  emptyTestId: TEST_IDS.assessmentsEmpty,
} as const;
