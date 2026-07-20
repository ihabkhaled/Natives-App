import { useAppMutation, useQueryClient } from '@/packages/query';

import { trainingQueryKeys } from '../queries/training.keys';
import { decideReview } from '../services/decide-review.service';
import type { ReviewDecisionCommand, ReviewSubmissionDetail } from '../types/training.types';
import type { TrainingMutationCallbacks } from '../types/training-view.types';

export interface ReviewDecisionMutationView {
  readonly run: (command: ReviewDecisionCommand) => void;
  readonly isRunning: boolean;
}

/** Approve / reject / request changes, always with the reviewer's note. */
export function useReviewDecisionMutation(
  teamId: string,
  callbacks: TrainingMutationCallbacks,
): ReviewDecisionMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<ReviewSubmissionDetail, ReviewDecisionCommand>({
    mutationFn: (command) => decideReview(teamId, command),
    onSuccess: (detail) => {
      queryClient.setQueryData(
        trainingQueryKeys.reviewDetail(teamId, detail.submission.id),
        detail,
      );
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: trainingQueryKeys.team(teamId) });
    },
  });
  return {
    run: (command) => {
      mutation.mutate(command);
    },
    isRunning: mutation.isPending,
  };
}
