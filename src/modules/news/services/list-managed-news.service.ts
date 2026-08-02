import { mapNewsPage } from '../mappers/news.mapper';
import { NEWS_SOURCE_STATUS } from '../news.constants';
import type { NewsListResponseDto } from '../types/news-wire.types';
import type { NewsPageResult } from '../types/news.types';

/**
 * TODO(news-endpoints, contract 1.8.0): `GET /news?includeDrafts=true`
 * (authenticated, `news.manage`) does not exist yet. The stub makes NO network
 * call and reports `unavailable`, so the newsroom shows an honest notice
 * instead of claiming the club has written nothing.
 *
 * Wiring it up is a one-file change: swap the empty stand-in below for
 * `await requestManagedNews(page)` and report `Ready`. The backend
 * re-authorizes the grant regardless of what the client believes.
 */
export function listManagedNews(page: number): Promise<NewsPageResult> {
  void page;
  const response: NewsListResponseDto = { items: [], total: 0 };
  return Promise.resolve({
    status: NEWS_SOURCE_STATUS.Unavailable,
    page: mapNewsPage(response),
  });
}
