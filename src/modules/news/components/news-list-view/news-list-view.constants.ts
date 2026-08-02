import { TEST_IDS } from '@/shared/config';

/** The five designed async states the public news list presents. */
export const NEWS_LIST_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.newsLoading,
  errorTestId: TEST_IDS.newsError,
  offlineTestId: TEST_IDS.newsOffline,
  forbiddenTestId: TEST_IDS.newsForbidden,
  emptyTestId: TEST_IDS.newsEmpty,
} as const;
