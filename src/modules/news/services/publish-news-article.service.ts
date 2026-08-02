import { NEWS_SOURCE_STATUS } from '../news.constants';
import type { NewsWriteResult } from '../types/news.types';

/**
 * TODO(news-endpoints, contract 1.8.0): `POST /news/{id}/publish`
 * (authenticated, `news.manage`) does not exist yet. The stub makes NO network
 * call and reports `unavailable`, so the publish button never claims a story
 * went live when nothing left the browser.
 *
 * Publishing is the moment a revision becomes what the public reads; it is a
 * separate action from saving for exactly that reason.
 *
 * Wiring it up is a one-file change: replace the body with a gateway
 * `requestPublishNewsArticle(articleId)` call mapped through `mapNewsArticle`.
 */
export function publishNewsArticle(articleId: string): Promise<NewsWriteResult> {
  void articleId;
  return Promise.resolve({ status: NEWS_SOURCE_STATUS.Unavailable, article: null });
}
