import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildSubmissionEvidenceQueryOptions } from '../queries/training.query';
import type { TrainingEvidence } from '../types/training.types';

/** Evidence metadata for one claim; the bytes stay in the upload service. */
export function useSubmissionEvidenceQuery(
  teamId: string,
  submissionId: string,
): RemoteQueryView<readonly TrainingEvidence[]> {
  return toRemoteQueryView(
    useAppQuery<readonly TrainingEvidence[]>(
      buildSubmissionEvidenceQueryOptions(teamId, submissionId),
    ),
  );
}
