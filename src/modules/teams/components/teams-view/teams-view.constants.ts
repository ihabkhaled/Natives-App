import { TEST_IDS } from '@/shared/config';

/** The five designed async states the teams screen can present. */
export const TEAMS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.teamsLoading,
  errorTestId: TEST_IDS.teamsError,
  offlineTestId: TEST_IDS.teamsOffline,
  forbiddenTestId: TEST_IDS.teamsForbidden,
  emptyTestId: TEST_IDS.teamsEmpty,
} as const;
