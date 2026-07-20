import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { resolveGoalTransition } from '../helpers/development-view.helper';
import { useAcknowledgeFeedbackMutation } from '../mutations/use-acknowledge-feedback-mutation.hook';
import { useGoalTransitionMutation } from '../mutations/use-goal-transition-mutation.hook';
import type { DevelopmentGoal } from '../types/assessments.types';

export interface DevelopmentActionsView {
  readonly acknowledge: (feedbackId: string, clarificationRequested: boolean) => void;
  readonly isAcknowledging: boolean;
  readonly transitionGoal: (goalId: string) => void;
  readonly isTransitioningGoal: boolean;
}

/** Feedback acknowledgement and goal transitions with their toasts. */
export function useDevelopmentActions(
  teamId: string,
  goals: readonly DevelopmentGoal[],
): DevelopmentActionsView {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const notify = (key: string, tone: 'success' | 'danger'): void => {
    void toast.showToast({ message: t(key), tone });
  };

  const acknowledgement = useAcknowledgeFeedbackMutation(teamId, {
    onSuccess: () => {
      notify(I18N_KEYS.assessments.feedbackAcknowledgedToast, 'success');
    },
    onError: () => {
      notify(I18N_KEYS.assessments.feedbackFailedToast, 'danger');
    },
  });
  const goalTransition = useGoalTransitionMutation(teamId, {
    onSuccess: () => {
      notify(I18N_KEYS.assessments.goalTransitionToast, 'success');
    },
    onError: () => {
      notify(I18N_KEYS.assessments.goalTransitionFailedToast, 'danger');
    },
  });

  return {
    acknowledge: (feedbackId, clarificationRequested) => {
      acknowledgement.acknowledge({ feedbackId, clarificationRequested });
    },
    isAcknowledging: acknowledgement.isAcknowledging,
    transitionGoal: (goalId) => {
      const entry = goals.find((candidate) => candidate.goal.id === goalId);
      const transition = entry === undefined ? null : resolveGoalTransition(entry.goal.status);
      if (entry === undefined || transition === null) {
        return;
      }
      goalTransition.run({
        goalId,
        transition,
        expectedRecordVersion: entry.goal.recordVersion,
      });
    },
    isTransitioningGoal: goalTransition.isRunning,
  };
}
