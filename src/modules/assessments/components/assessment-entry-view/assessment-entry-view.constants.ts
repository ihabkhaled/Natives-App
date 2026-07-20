import { TEST_IDS } from '@/shared/config';

export const ASSESSMENT_ENTRY_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.assessmentEntryLoading,
  errorTestId: TEST_IDS.assessmentEntryError,
  offlineTestId: TEST_IDS.assessmentsOffline,
  forbiddenTestId: TEST_IDS.assessmentEntryForbidden,
  emptyTestId: TEST_IDS.assessmentsEmpty,
} as const;
