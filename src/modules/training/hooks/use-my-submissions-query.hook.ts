import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildMySubmissionsQueryOptions } from '../queries/training.query';
import type { TrainingSubmissionPage } from '../types/training.types';

/** One bounded page of the caller's own training claims. */
export function useMySubmissionsQuery(teamId: string): RemoteQueryView<TrainingSubmissionPage> {
  return toRemoteQueryView(
    useAppQuery<TrainingSubmissionPage>(buildMySubmissionsQueryOptions(teamId)),
  );
}
