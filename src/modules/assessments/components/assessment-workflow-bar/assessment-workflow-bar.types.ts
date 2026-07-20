import type { AssessmentWorkflowStep } from '../../constants/assessments.constants';
import type { WorkflowActionView } from '../../types/assessments-view.types';

export interface AssessmentWorkflowBarProps {
  readonly workflowLabel: string;
  readonly completenessLabel: string;
  readonly completenessValue: string;
  readonly completenessPercent: number;
  readonly readOnlyLabel: string;
  readonly isEditable: boolean;
  readonly saveLabel: string;
  readonly isSaving: boolean;
  readonly isTransitioning: boolean;
  readonly actions: readonly WorkflowActionView[];
  readonly onSave: () => void;
  readonly onWorkflowStep: (step: AssessmentWorkflowStep) => void;
}
