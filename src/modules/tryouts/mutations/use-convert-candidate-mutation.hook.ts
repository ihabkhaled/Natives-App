import { useInvalidatingMutation } from '@/packages/query';

import { tryoutsQueryKeys } from '../queries/tryouts.keys';
import { convertCandidate } from '../services/convert-candidate.service';
import type { CandidateActionView, TryoutsMutationCallbacks } from '../types/mutation.types';
import type { ConversionResult } from '../types/tryouts.types';

/** Convert an accepted candidate into a member. The call is idempotent. */
export function useConvertCandidateMutation(
  teamId: string,
  tryoutId: string,
  callbacks: TryoutsMutationCallbacks,
): CandidateActionView {
  return useInvalidatingMutation<ConversionResult, string>({
    mutationFn: (candidateId) => convertCandidate(teamId, tryoutId, candidateId),
    invalidateKey: tryoutsQueryKeys.detail(teamId, tryoutId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
