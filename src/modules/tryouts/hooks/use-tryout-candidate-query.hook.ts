import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildTryoutCandidateQueryOptions } from '../queries/tryouts.query';
import type { CandidateDetail } from '../types/tryouts.types';

/** One candidate record, restricted blocks included only when permitted. */
export function useTryoutCandidateQuery(
  teamId: string,
  tryoutId: string,
  candidateId: string,
): RemoteQueryView<CandidateDetail> {
  return toRemoteQueryView(
    useAppQuery<CandidateDetail>(buildTryoutCandidateQueryOptions(teamId, tryoutId, candidateId)),
  );
}
