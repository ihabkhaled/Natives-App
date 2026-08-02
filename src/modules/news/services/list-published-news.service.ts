import { mapNewsPage } from '../mappers/news.mapper';
import { NEWS_SOURCE_STATUS } from '../news.constants';
import type { NewsListResponseDto } from '../types/news-wire.types';
import type { NewsPageResult } from '../types/news.types';

/**
 * TODO(news-endpoints, contract 1.8.0): `GET /news` (public, unauthenticated,
 * published only, bounded + paginated) does not exist yet. Inventing the call
 * would 404 for every visitor, so this stub takes the exact query the real
 * endpoint will accept, makes NO network call, and reports `unavailable` —
 * the list screen turns that into an honest "coming soon" notice instead of a
 * fake empty page or a spurious error.
 *
 * Wiring it up is a one-file change: swap the empty stand-in below for
 * `await requestPublishedNews(page)` (`@/packages/http` + a response schema)
 * and report `Ready`. The mapper, the query hook, the screen hook and the
 * view all stay exactly as they are.
 */
export function listPublishedNews(page: number): Promise<NewsPageResult> {
  void page;
  const response: NewsListResponseDto = { items: [], total: 0 };
  return Promise.resolve({
    status: NEWS_SOURCE_STATUS.Unavailable,
    page: mapNewsPage(response),
  });
}
