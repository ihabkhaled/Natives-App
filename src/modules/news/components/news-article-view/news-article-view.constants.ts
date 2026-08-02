import { TEST_IDS } from '@/shared/config';

/** The five designed async states one public story presents. */
export const NEWS_ARTICLE_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.newsArticleLoading,
  errorTestId: TEST_IDS.newsArticleError,
  offlineTestId: TEST_IDS.newsArticleOffline,
  forbiddenTestId: TEST_IDS.newsArticleForbidden,
  emptyTestId: TEST_IDS.newsArticleEmpty,
} as const;
