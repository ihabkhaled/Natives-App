import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildManagedNewsQueryOptions } from '../queries/news.query';
import type { NewsPageResult } from '../types/news.types';

/** Every story including drafts; issued only for a `news.manage` session. */
export function useManagedNewsQuery(
  page: number,
  permitted: boolean,
): RemoteQueryView<NewsPageResult> {
  return toRemoteQueryView(
    useAppQuery<NewsPageResult>(buildManagedNewsQueryOptions(page, permitted)),
  );
}
