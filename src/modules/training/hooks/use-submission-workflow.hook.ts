import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast, useConfirmAlert } from '@/shared/ui';

import { useSubmissionTransitionMutation } from '../mutations/use-submission-transition-mutation.hook';
import type { TrainingSubmission } from '../types/training.types';

export interface SubmissionWorkflowView {
  readonly submit: () => void;
  readonly withdraw: () => void;
  readonly isRunning: boolean;
}

/**
 * Confirm-then-transition wiring for one claim. Both actions ask first and
 * both carry the record version, so a claim someone else already moved fails
 * loudly instead of silently overwriting their decision.
 */
export function useSubmissionWorkflow(
  teamId: string,
  submission: TrainingSubmission | null,
): SubmissionWorkflowView {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const confirm = useConfirmAlert();

  const transition = useSubmissionTransitionMutation(teamId, {
    onSuccess: () => {
      void toast.showToast({ message: t(I18N_KEYS.training.submittedToast), tone: 'success' });
    },
    onError: () => {
      void toast.showToast({ message: t(I18N_KEYS.training.actionFailedToast), tone: 'danger' });
    },
  });

  function run(intent: 'submit' | 'withdraw', titleKey: string, bodyKey: string): void {
    if (submission === null) {
      return;
    }
    const { id, recordVersion } = submission;
    void confirm
      .confirm({
        header: t(titleKey),
        message: t(bodyKey),
        confirmLabel: t(I18N_KEYS.training.confirmProceed),
        cancelLabel: t(I18N_KEYS.training.confirmCancel),
      })
      .then((confirmed) => {
        if (confirmed) {
          transition.run({ submissionId: id, expectedRecordVersion: recordVersion, intent });
        }
      });
  }

  return {
    submit: () => {
      run('submit', I18N_KEYS.training.submitConfirmTitle, I18N_KEYS.training.submitConfirmMessage);
    },
    withdraw: () => {
      run(
        'withdraw',
        I18N_KEYS.training.withdrawConfirmTitle,
        I18N_KEYS.training.withdrawConfirmMessage,
      );
    },
    isRunning: transition.isRunning,
  };
}
