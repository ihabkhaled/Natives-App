import { useInvalidatingMutation } from '@/packages/query';

import { tryoutsQueryKeys } from '../queries/tryouts.keys';
import { saveEvaluation } from '../services/save-evaluation.service';
import type { EvaluationMutationView, TryoutsMutationCallbacks } from '../types/mutation.types';
import type { CandidateDetail, SaveEvaluationCommand } from '../types/tryouts.types';

/** Record evaluator scores and the evaluator note. */
export function useSaveEvaluationMutation(
  teamId: string,
  tryoutId: string,
  callbacks: TryoutsMutationCallbacks,
): EvaluationMutationView {
  return useInvalidatingMutation<CandidateDetail, SaveEvaluationCommand>({
    mutationFn: (command) => saveEvaluation(teamId, tryoutId, command),
    invalidateKey: tryoutsQueryKeys.detail(teamId, tryoutId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
