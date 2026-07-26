import { TEST_IDS } from '@/shared/config';

/** The five designed states the rules screen can present. */
export const STANDINGS_RULES_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.standingsRulesLoading,
  errorTestId: TEST_IDS.standingsRulesErrorState,
  offlineTestId: TEST_IDS.standingsRulesOffline,
  forbiddenTestId: TEST_IDS.standingsRulesForbidden,
  emptyTestId: TEST_IDS.standingsRulesEmpty,
} as const;
