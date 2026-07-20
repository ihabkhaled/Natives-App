import { requestSubmitSubmission, requestWithdrawSubmission } from '../gateways/training.gateway';
import { runTrainingRequest } from '../helpers/to-training-error.helper';
import { mapSubmissionDetail } from '../mappers/activity.mapper';
import type { SubmissionTransition, TrainingSubmissionDetail } from '../types/training.types';

/**
 * Use case: move a claim into or out of the review queue. Submit doubles as
 * the resubmit path after changes were requested; both carry the record
 * version so a claim changed elsewhere fails loudly.
 */
export function transitionSubmission(
  teamId: string,
  input: SubmissionTransition,
): Promise<TrainingSubmissionDetail> {
  return runTrainingRequest(async () =>
    mapSubmissionDetail(
      input.intent === 'submit'
        ? await requestSubmitSubmission(teamId, input.submissionId, input.expectedRecordVersion)
        : await requestWithdrawSubmission(teamId, input.submissionId, input.expectedRecordVersion),
    ),
  );
}
