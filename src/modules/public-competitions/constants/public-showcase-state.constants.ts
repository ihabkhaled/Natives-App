import { TEST_IDS } from '@/shared/config';

/** The five designed async states the public competition list can present. */
export const PUBLIC_COMPETITIONS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.publicCompetitionsLoading,
  errorTestId: TEST_IDS.publicCompetitionsError,
  offlineTestId: TEST_IDS.publicCompetitionsOffline,
  forbiddenTestId: TEST_IDS.publicCompetitionsForbidden,
  emptyTestId: TEST_IDS.publicCompetitionsEmpty,
} as const;

/** The same five states, as the detail screen presents them. */
export const PUBLIC_COMPETITION_DETAIL_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.publicCompetitionDetailLoading,
  errorTestId: TEST_IDS.publicCompetitionDetailError,
  offlineTestId: TEST_IDS.publicCompetitionDetailOffline,
  forbiddenTestId: TEST_IDS.publicCompetitionDetailForbidden,
  emptyTestId: TEST_IDS.publicCompetitionDetailEmpty,
} as const;
