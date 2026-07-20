import { useAppMutation, useQueryClient } from '@/packages/query';

import { assessmentsQueryKeys } from '../queries/assessments.keys';
import { transitionAssessment } from '../services/transition-assessment.service';
import type { AssessmentDetail, AssessmentTransitionInput } from '../types/assessments.types';

interface WorkflowCallbacks {
  readonly onSuccess: (detail: AssessmentDetail) => void;
  readonly onError: () => void;
}

export interface AssessmentWorkflowMutationView {
  readonly run: (input: AssessmentTransitionInput) => void;
  readonly isRunning: boolean;
}

/** Draft → submitted → in review → approved → published, one step per call. */
export function useAssessmentWorkflowMutation(
  teamId: string,
  callbacks: WorkflowCallbacks,
): AssessmentWorkflowMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<AssessmentDetail, AssessmentTransitionInput>({
    mutationFn: (input) => transitionAssessment(teamId, input),
    onSuccess: (detail) => {
      queryClient.setQueryData(assessmentsQueryKeys.detail(teamId, detail.assessment.id), detail);
      callbacks.onSuccess(detail);
    },
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentsQueryKeys.team(teamId) });
    },
  });
  return {
    run: (input) => {
      mutation.mutate(input);
    },
    isRunning: mutation.isPending,
  };
}
