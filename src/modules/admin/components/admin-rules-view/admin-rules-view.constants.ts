import { TEST_IDS } from '@/shared/config';

/** The five designed async states the rules screen can present. */
export const RULES_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.adminRulesLoading,
  errorTestId: TEST_IDS.adminRulesError,
  offlineTestId: TEST_IDS.adminRulesOffline,
  forbiddenTestId: TEST_IDS.adminRulesForbidden,
  emptyTestId: TEST_IDS.adminRulesEmpty,
} as const;
