import { requestCreateSubmission } from '../gateways/training.gateway';
import { runTrainingRequest } from '../helpers/to-training-error.helper';
import { mapSubmissionDetail } from '../mappers/activity.mapper';
import type { SubmissionDraft, TrainingSubmissionDetail } from '../types/training.types';

/** Use case: create a draft claim from the composer. */
export function createSubmission(
  teamId: string,
  draft: SubmissionDraft,
): Promise<TrainingSubmissionDetail> {
  return runTrainingRequest(async () =>
    mapSubmissionDetail(await requestCreateSubmission(teamId, draft)),
  );
}
