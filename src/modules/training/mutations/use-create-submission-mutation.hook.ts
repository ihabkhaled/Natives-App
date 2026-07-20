import { useAppMutation, useQueryClient } from '@/packages/query';

import { trainingQueryKeys } from '../queries/training.keys';
import { createSubmission } from '../services/create-submission.service';
import type { SubmissionDraft, TrainingSubmissionDetail } from '../types/training.types';
import type { TrainingMutationCallbacks } from '../types/training-view.types';

export interface CreateSubmissionMutationView {
  readonly run: (draft: SubmissionDraft) => void;
  readonly isRunning: boolean;
}

/** Create a draft claim from the composer, then refresh the caller's list. */
export function useCreateSubmissionMutation(
  teamId: string,
  callbacks: TrainingMutationCallbacks,
): CreateSubmissionMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<TrainingSubmissionDetail, SubmissionDraft>({
    mutationFn: (draft) => createSubmission(teamId, draft),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: trainingQueryKeys.team(teamId) });
    },
  });
  return {
    run: (draft) => {
      mutation.mutate(draft);
    },
    isRunning: mutation.isPending,
  };
}
