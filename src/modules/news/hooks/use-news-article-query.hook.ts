import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildNewsArticleQueryOptions } from '../queries/news.query';
import type { NewsArticleResult } from '../types/news.types';

/** One published story by slug, readable without a session. */
export function useNewsArticleQuery(slug: string): RemoteQueryView<NewsArticleResult> {
  return toRemoteQueryView(useAppQuery<NewsArticleResult>(buildNewsArticleQueryOptions(slug)));
}
