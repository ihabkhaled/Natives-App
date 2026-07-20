import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildReviewQueueQueryOptions } from '../queries/training.query';
import type { ReviewQueuePage } from '../types/training.types';

/** The reviewer queue, optionally narrowed to a single status. */
export function useReviewQueueQuery(
  teamId: string,
  status: string | null,
): RemoteQueryView<ReviewQueuePage> {
  return toRemoteQueryView(
    useAppQuery<ReviewQueuePage>(buildReviewQueueQueryOptions(teamId, status)),
  );
}
