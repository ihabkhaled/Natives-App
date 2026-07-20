import { requestReviewDecision } from '../gateways/training.gateway';
import { runTrainingRequest } from '../helpers/to-training-error.helper';
import { mapReviewDetail } from '../mappers/activity.mapper';
import type { ReviewDecisionCommand, ReviewSubmissionDetail } from '../types/training.types';

/** Use case: record approve / reject / request-changes with its note. */
export function decideReview(
  teamId: string,
  command: ReviewDecisionCommand,
): Promise<ReviewSubmissionDetail> {
  return runTrainingRequest(async () =>
    mapReviewDetail(await requestReviewDecision(teamId, command)),
  );
}
