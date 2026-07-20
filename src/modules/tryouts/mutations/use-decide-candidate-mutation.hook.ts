import { useInvalidatingMutation } from '@/packages/query';

import { tryoutsQueryKeys } from '../queries/tryouts.keys';
import { decideCandidate } from '../services/decide-candidate.service';
import type { DecisionMutationView, TryoutsMutationCallbacks } from '../types/mutation.types';
import type { CandidateDetail, DecideCandidateCommand } from '../types/tryouts.types';

/** Accept, waitlist, or decline a candidate with a recorded reason. */
export function useDecideCandidateMutation(
  teamId: string,
  tryoutId: string,
  callbacks: TryoutsMutationCallbacks,
): DecisionMutationView {
  return useInvalidatingMutation<CandidateDetail, DecideCandidateCommand>({
    mutationFn: (command) => decideCandidate(teamId, tryoutId, command),
    invalidateKey: tryoutsQueryKeys.detail(teamId, tryoutId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
