import { requestSubmissionEvidence } from '../gateways/training.gateway';
import { runTrainingRequest } from '../helpers/to-training-error.helper';
import { mapEvidenceList } from '../mappers/activity.mapper';
import type { TrainingEvidence } from '../types/training.types';

/** Use case: the evidence metadata attached to one claim. */
export function listSubmissionEvidence(
  teamId: string,
  submissionId: string,
): Promise<readonly TrainingEvidence[]> {
  return runTrainingRequest(async () =>
    mapEvidenceList(await requestSubmissionEvidence(teamId, submissionId)),
  );
}
