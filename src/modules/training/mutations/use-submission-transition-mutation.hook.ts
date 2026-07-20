import { useAppMutation, useQueryClient } from '@/packages/query';

import { trainingQueryKeys } from '../queries/training.keys';
import { transitionSubmission } from '../services/transition-submission.service';
import type { SubmissionTransition, TrainingSubmissionDetail } from '../types/training.types';
import type { TrainingMutationCallbacks } from '../types/training-view.types';

export interface SubmissionTransitionMutationView {
  readonly run: (input: SubmissionTransition) => void;
  readonly isRunning: boolean;
}

/**
 * Submit / resubmit / withdraw. Every call carries the record version so a
 * claim changed elsewhere fails loudly instead of silently overwriting.
 */
export function useSubmissionTransitionMutation(
  teamId: string,
  callbacks: TrainingMutationCallbacks,
): SubmissionTransitionMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<TrainingSubmissionDetail, SubmissionTransition>({
    mutationFn: (input) => transitionSubmission(teamId, input),
    onSuccess: (detail) => {
      queryClient.setQueryData(trainingQueryKeys.submission(teamId, detail.submission.id), detail);
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: trainingQueryKeys.team(teamId) });
    },
  });
  return {
    run: (input) => {
      mutation.mutate(input);
    },
    isRunning: mutation.isPending,
  };
}
