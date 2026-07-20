import type { AssessmentSummaryView } from '../../types/assessments-view.types';

export interface AssessmentSummaryRowProps {
  readonly item: AssessmentSummaryView;
  readonly onOpen: () => void;
}
