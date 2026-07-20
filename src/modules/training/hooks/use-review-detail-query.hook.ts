import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildReviewDetailQueryOptions } from '../queries/training.query';
import type { ReviewSubmissionDetail } from '../types/training.types';

/** One queued claim with its advisory anti-abuse signals. */
export function useReviewDetailQuery(
  teamId: string,
  submissionId: string,
): RemoteQueryView<ReviewSubmissionDetail> {
  return toRemoteQueryView(
    useAppQuery<ReviewSubmissionDetail>(buildReviewDetailQueryOptions(teamId, submissionId)),
  );
}
