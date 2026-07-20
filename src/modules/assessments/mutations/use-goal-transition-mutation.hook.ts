import { useAppMutation, useQueryClient } from '@/packages/query';

import { assessmentsQueryKeys } from '../queries/assessments.keys';
import { transitionGoal } from '../services/transition-goal.service';
import type { DevelopmentGoal, GoalTransitionInput } from '../types/assessments.types';

interface GoalTransitionCallbacks {
  readonly onSuccess: () => void;
  readonly onError: () => void;
}

export interface GoalTransitionMutationView {
  readonly run: (input: GoalTransitionInput) => void;
  readonly isRunning: boolean;
}

/** Moves one development goal along its lifecycle. */
export function useGoalTransitionMutation(
  teamId: string,
  callbacks: GoalTransitionCallbacks,
): GoalTransitionMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<DevelopmentGoal, GoalTransitionInput>({
    mutationFn: (input) => transitionGoal(teamId, input),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: assessmentsQueryKeys.myGoals(teamId) });
    },
  });
  return {
    run: (input) => {
      mutation.mutate(input);
    },
    isRunning: mutation.isPending,
  };
}
