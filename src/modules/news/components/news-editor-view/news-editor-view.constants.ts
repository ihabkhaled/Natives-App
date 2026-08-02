import { TEST_IDS } from '@/shared/config';

/** The five designed async states the newsroom presents. */
export const NEWS_EDITOR_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.newsEditorLoading,
  errorTestId: TEST_IDS.newsEditorError,
  offlineTestId: TEST_IDS.newsEditorOffline,
  forbiddenTestId: TEST_IDS.newsEditorForbidden,
  emptyTestId: TEST_IDS.newsEditorEmpty,
} as const;
