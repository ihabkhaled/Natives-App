import { requestReviewDetail } from '../gateways/training.gateway';
import { runTrainingRequest } from '../helpers/to-training-error.helper';
import { mapReviewDetail } from '../mappers/activity.mapper';
import type { ReviewSubmissionDetail } from '../types/training.types';

/** Use case: one queued claim with its advisory signals. */
export function getReviewDetail(
  teamId: string,
  submissionId: string,
): Promise<ReviewSubmissionDetail> {
  return runTrainingRequest(async () =>
    mapReviewDetail(await requestReviewDetail(teamId, submissionId)),
  );
}
