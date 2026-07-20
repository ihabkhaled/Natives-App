import { useAppMutation, useQueryClient } from '@/packages/query';

import { assessmentsQueryKeys } from '../queries/assessments.keys';
import { acknowledgeFeedback } from '../services/acknowledge-feedback.service';
import type { AcknowledgeFeedbackInput } from '../types/assessments.types';

interface AcknowledgeCallbacks {
  readonly onSuccess: () => void;
  readonly onError: () => void;
}

export interface AcknowledgeFeedbackMutationView {
  readonly acknowledge: (input: AcknowledgeFeedbackInput) => void;
  readonly isAcknowledging: boolean;
}

/** Records that the player read one published feedback record. */
export function useAcknowledgeFeedbackMutation(
  teamId: string,
  callbacks: AcknowledgeCallbacks,
): AcknowledgeFeedbackMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<string, AcknowledgeFeedbackInput>({
    mutationFn: (input) => acknowledgeFeedback(teamId, input),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentsQueryKeys.myFeedback(teamId) });
    },
  });
  return {
    acknowledge: (input) => {
      mutation.mutate(input);
    },
    isAcknowledging: mutation.isPending,
  };
}
