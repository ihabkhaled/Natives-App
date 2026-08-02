import { TEST_IDS } from '@/shared/config';

import type { LandingSeamStateTestIds } from '../landing-seam-section';

export const LANDING_STAFF_STATE_TEST_IDS: LandingSeamStateTestIds = {
  loadingTestId: TEST_IDS.landingStaffLoading,
  errorTestId: TEST_IDS.landingStaffError,
  offlineTestId: TEST_IDS.landingStaffOffline,
  forbiddenTestId: TEST_IDS.landingStaffForbidden,
  emptyTestId: TEST_IDS.landingStaffEmpty,
};
