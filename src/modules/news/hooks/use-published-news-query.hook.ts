import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildPublishedNewsQueryOptions } from '../queries/news.query';
import type { NewsPageResult } from '../types/news.types';

/** One bounded page of published stories, readable without a session. */
export function usePublishedNewsQuery(page: number): RemoteQueryView<NewsPageResult> {
  return toRemoteQueryView(useAppQuery<NewsPageResult>(buildPublishedNewsQueryOptions(page)));
}
