import { requestSubmission } from '../gateways/training.gateway';
import { runTrainingRequest } from '../helpers/to-training-error.helper';
import { mapSubmissionDetail } from '../mappers/activity.mapper';
import type { TrainingSubmissionDetail } from '../types/training.types';

/** Use case: one training claim with its buddies and evidence count. */
export function getSubmission(
  teamId: string,
  submissionId: string,
): Promise<TrainingSubmissionDetail> {
  return runTrainingRequest(async () =>
    mapSubmissionDetail(await requestSubmission(teamId, submissionId)),
  );
}
