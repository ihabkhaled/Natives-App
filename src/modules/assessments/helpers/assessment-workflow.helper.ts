import { PERMISSIONS } from '@/shared/security';

import { ASSESSMENT_STATUS, ASSESSMENT_WORKFLOW_STEP } from '../constants/assessments.constants';
import type { AssessmentStatus, AssessmentWorkflowStep } from '../constants/assessments.constants';

/**
 * The permission each workflow step needs. These gate convenience UI only —
 * the backend re-authorizes every transition and remains the sole authority.
 */
const STEP_PERMISSIONS: Record<AssessmentWorkflowStep, string> = {
  [ASSESSMENT_WORKFLOW_STEP.Submit]: PERMISSIONS.assessmentCreate,
  [ASSESSMENT_WORKFLOW_STEP.StartReview]: PERMISSIONS.assessmentReview,
  [ASSESSMENT_WORKFLOW_STEP.Approve]: PERMISSIONS.assessmentReview,
  [ASSESSMENT_WORKFLOW_STEP.Reject]: PERMISSIONS.assessmentReview,
  [ASSESSMENT_WORKFLOW_STEP.Publish]: PERMISSIONS.assessmentPublish,
};

/** Which steps the lifecycle itself allows from a given status. */
const STATUS_STEPS: Record<AssessmentStatus, readonly AssessmentWorkflowStep[]> = {
  [ASSESSMENT_STATUS.Draft]: [ASSESSMENT_WORKFLOW_STEP.Submit],
  [ASSESSMENT_STATUS.Submitted]: [ASSESSMENT_WORKFLOW_STEP.StartReview],
  [ASSESSMENT_STATUS.InReview]: [ASSESSMENT_WORKFLOW_STEP.Approve, ASSESSMENT_WORKFLOW_STEP.Reject],
  [ASSESSMENT_STATUS.Approved]: [ASSESSMENT_WORKFLOW_STEP.Publish],
  [ASSESSMENT_STATUS.Published]: [],
  [ASSESSMENT_STATUS.Revised]: [],
};

export function permissionForStep(step: AssessmentWorkflowStep): string {
  return STEP_PERMISSIONS[step];
}

/** Steps offered for a status, filtered by the principal effective grants. */
export function availableWorkflowSteps(
  status: AssessmentStatus,
  permissions: readonly string[],
): readonly AssessmentWorkflowStep[] {
  return STATUS_STEPS[status].filter((step) => permissions.includes(permissionForStep(step)));
}

/** Values are editable only while the record is still a draft. */
export function isEditableStatus(status: AssessmentStatus): boolean {
  return status === ASSESSMENT_STATUS.Draft;
}

/** A superseded or published revision is read-only for everyone. */
export function isReadOnlyStatus(status: AssessmentStatus): boolean {
  return status === ASSESSMENT_STATUS.Published || status === ASSESSMENT_STATUS.Revised;
}

/** Whether the principal may open the coach workspace at all. */
export function canReadTeamAssessments(permissions: readonly string[]): boolean {
  return permissions.includes(PERMISSIONS.assessmentReadTeam);
}

/** Whether the principal may see their own published assessments. */
export function canReadOwnAssessments(permissions: readonly string[]): boolean {
  return permissions.includes(PERMISSIONS.assessmentReadSelfPublished);
}

/** Whether the principal may see their own published coach feedback. */
export function canReadOwnFeedback(permissions: readonly string[]): boolean {
  return permissions.includes(PERMISSIONS.feedbackReadSelf);
}
