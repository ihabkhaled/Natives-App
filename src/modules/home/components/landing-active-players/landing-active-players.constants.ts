import { TEST_IDS } from '@/shared/config';

import type { LandingSeamStateTestIds } from '../landing-seam-section';

export const LANDING_PLAYERS_STATE_TEST_IDS: LandingSeamStateTestIds = {
  loadingTestId: TEST_IDS.landingPlayersLoading,
  errorTestId: TEST_IDS.landingPlayersError,
  offlineTestId: TEST_IDS.landingPlayersOffline,
  forbiddenTestId: TEST_IDS.landingPlayersForbidden,
  emptyTestId: TEST_IDS.landingPlayersEmpty,
};
