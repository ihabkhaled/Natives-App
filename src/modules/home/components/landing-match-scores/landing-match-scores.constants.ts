import { TEST_IDS } from '@/shared/config';

import type { LandingSeamStateTestIds } from '../landing-seam-section';

export const LANDING_MATCHES_STATE_TEST_IDS: LandingSeamStateTestIds = {
  loadingTestId: TEST_IDS.landingMatchesLoading,
  errorTestId: TEST_IDS.landingMatchesError,
  offlineTestId: TEST_IDS.landingMatchesOffline,
  forbiddenTestId: TEST_IDS.landingMatchesForbidden,
  emptyTestId: TEST_IDS.landingMatchesEmpty,
};
