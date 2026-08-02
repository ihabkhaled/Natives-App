import { TEST_IDS } from '@/shared/config';

import type { LandingSeamStateTestIds } from '../landing-seam-section';

export const LANDING_COMPETITIONS_STATE_TEST_IDS: LandingSeamStateTestIds = {
  loadingTestId: TEST_IDS.landingCompetitionsLoading,
  errorTestId: TEST_IDS.landingCompetitionsError,
  offlineTestId: TEST_IDS.landingCompetitionsOffline,
  forbiddenTestId: TEST_IDS.landingCompetitionsForbidden,
  emptyTestId: TEST_IDS.landingCompetitionsEmpty,
};
