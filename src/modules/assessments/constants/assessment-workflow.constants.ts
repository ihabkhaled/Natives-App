import { TEST_IDS } from '@/shared/config';
import { I18N_KEYS } from '@/shared/i18n';

import type { WorkflowActionView } from '../types/assessments-view.types';
import { ASSESSMENT_WORKFLOW_STEP } from './assessments.constants';
import type { AssessmentWorkflowStep } from './assessments.constants';

interface WorkflowButtonDescriptor {
  readonly labelKey: string;
  readonly tone: WorkflowActionView['tone'];
  readonly testId: string;
}

/** Presentation for each workflow step: copy key, action weight, and test id. */
export const WORKFLOW_BUTTONS: Record<AssessmentWorkflowStep, WorkflowButtonDescriptor> = {
  [ASSESSMENT_WORKFLOW_STEP.Submit]: {
    labelKey: I18N_KEYS.assessments.submit,
    tone: 'primary',
    testId: TEST_IDS.assessmentSubmit,
  },
  [ASSESSMENT_WORKFLOW_STEP.StartReview]: {
    labelKey: I18N_KEYS.assessments.startReview,
    tone: 'primary',
    testId: TEST_IDS.assessmentStartReview,
  },
  [ASSESSMENT_WORKFLOW_STEP.Approve]: {
    labelKey: I18N_KEYS.assessments.approve,
    tone: 'primary',
    testId: TEST_IDS.assessmentApprove,
  },
  [ASSESSMENT_WORKFLOW_STEP.Reject]: {
    labelKey: I18N_KEYS.assessments.reject,
    tone: 'secondary',
    testId: TEST_IDS.assessmentReject,
  },
  [ASSESSMENT_WORKFLOW_STEP.Publish]: {
    labelKey: I18N_KEYS.assessments.publish,
    tone: 'primary',
    testId: TEST_IDS.assessmentPublish,
  },
};
