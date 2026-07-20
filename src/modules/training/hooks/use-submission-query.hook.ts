import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildSubmissionQueryOptions } from '../queries/training.query';
import type { TrainingSubmissionDetail } from '../types/training.types';

/** One training claim with its buddies and evidence count. */
export function useSubmissionQuery(
  teamId: string,
  submissionId: string,
): RemoteQueryView<TrainingSubmissionDetail> {
  return toRemoteQueryView(
    useAppQuery<TrainingSubmissionDetail>(buildSubmissionQueryOptions(teamId, submissionId)),
  );
}
