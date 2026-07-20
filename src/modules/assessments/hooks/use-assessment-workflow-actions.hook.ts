import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { ASSESSMENT_STATUS } from '../constants/assessments.constants';
import type { AssessmentWorkflowStep } from '../constants/assessments.constants';
import { useAssessmentWorkflowMutation } from '../mutations/use-assessment-workflow-mutation.hook';
import { useSaveAssessmentMutation } from '../mutations/use-save-assessment-mutation.hook';
import type { SaveAssessmentValuesInput } from '../types/assessments.types';

export interface AssessmentWorkflowActionsView {
  readonly save: (input: SaveAssessmentValuesInput) => void;
  readonly isSaving: boolean;
  readonly run: (step: AssessmentWorkflowStep, expectedRecordVersion: number) => void;
  readonly isTransitioning: boolean;
}

/**
 * Save + workflow commands with their toasts. A stale record version surfaces
 * conflict copy instead of silently overwriting a colleague's entry.
 */
export function useAssessmentWorkflowActions(
  teamId: string,
  assessmentId: string,
): AssessmentWorkflowActionsView {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const notify = (key: string, tone: 'success' | 'danger' | 'warning'): void => {
    void toast.showToast({ message: t(key), tone });
  };

  const save = useSaveAssessmentMutation(teamId, assessmentId, {
    onSuccess: () => {
      notify(I18N_KEYS.assessments.savedToast, 'success');
    },
    onConflict: () => {
      notify(I18N_KEYS.assessments.saveConflictToast, 'warning');
    },
    onError: () => {
      notify(I18N_KEYS.assessments.saveFailedToast, 'danger');
    },
  });
  const workflow = useAssessmentWorkflowMutation(teamId, {
    onSuccess: (detail) => {
      notify(
        detail.assessment.status === ASSESSMENT_STATUS.Published
          ? I18N_KEYS.assessments.publishedToast
          : I18N_KEYS.assessments.submittedToast,
        'success',
      );
    },
    onError: () => {
      notify(I18N_KEYS.assessments.workflowFailedToast, 'danger');
    },
  });

  return {
    save: save.save,
    isSaving: save.isSaving,
    run: (step, expectedRecordVersion) => {
      workflow.run({ assessmentId, expectedRecordVersion, step });
    },
    isTransitioning: workflow.isRunning,
  };
}
