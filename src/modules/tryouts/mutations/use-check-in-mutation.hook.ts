import { useInvalidatingMutation } from '@/packages/query';

import { tryoutsQueryKeys } from '../queries/tryouts.keys';
import { checkInCandidate } from '../services/check-in-candidate.service';
import type { CandidateActionView, TryoutsMutationCallbacks } from '../types/mutation.types';
import type { CandidateDetail } from '../types/tryouts.types';

/** Check one candidate in, then refresh the event caches. */
export function useCheckInMutation(
  teamId: string,
  tryoutId: string,
  callbacks: TryoutsMutationCallbacks,
): CandidateActionView {
  return useInvalidatingMutation<CandidateDetail, string>({
    mutationFn: (candidateId) => checkInCandidate(teamId, tryoutId, candidateId),
    invalidateKey: tryoutsQueryKeys.detail(teamId, tryoutId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
