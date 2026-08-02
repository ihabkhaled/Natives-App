import { NEWS_SOURCE_STATUS } from '../news.constants';
import type { NewsArticleResult } from '../types/news.types';

/**
 * TODO(news-endpoints, contract 1.8.0): `GET /news/{slug}` (public,
 * unauthenticated, published only) does not exist yet. The stub takes the
 * slug the real endpoint will take, makes NO network call, and reports
 * `unavailable`, so the detail screen shows a "coming soon" notice rather
 * than a 404 the backend never actually sent.
 *
 * Wiring it up is a one-file change: replace the body with a gateway
 * `requestPublishedNewsArticle(slug)` call mapped through `mapNewsArticle`,
 * keeping this signature.
 */
export function getPublishedNewsArticle(slug: string): Promise<NewsArticleResult> {
  void slug;
  return Promise.resolve({ status: NEWS_SOURCE_STATUS.Unavailable, article: null });
}
