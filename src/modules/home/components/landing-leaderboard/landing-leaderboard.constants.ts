import { TEST_IDS } from '@/shared/config';

import type { LandingSeamStateTestIds } from '../landing-seam-section';

export const LANDING_LEADERBOARD_STATE_TEST_IDS: LandingSeamStateTestIds = {
  loadingTestId: TEST_IDS.landingLeaderboardLoading,
  errorTestId: TEST_IDS.landingLeaderboardError,
  offlineTestId: TEST_IDS.landingLeaderboardOffline,
  forbiddenTestId: TEST_IDS.landingLeaderboardForbidden,
  emptyTestId: TEST_IDS.landingLeaderboardEmpty,
};
