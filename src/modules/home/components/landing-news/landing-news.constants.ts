import { TEST_IDS } from '@/shared/config';

import type { LandingSeamStateTestIds } from '../landing-seam-section';

export const LANDING_NEWS_STATE_TEST_IDS: LandingSeamStateTestIds = {
  loadingTestId: TEST_IDS.landingNewsLoading,
  errorTestId: TEST_IDS.landingNewsError,
  offlineTestId: TEST_IDS.landingNewsOffline,
  forbiddenTestId: TEST_IDS.landingNewsForbidden,
  emptyTestId: TEST_IDS.landingNewsEmpty,
};
