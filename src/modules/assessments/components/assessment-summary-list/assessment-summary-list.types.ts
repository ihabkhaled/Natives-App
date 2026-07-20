import type { AssessmentSummaryView } from '../../types/assessments-view.types';

export interface AssessmentSummaryListProps {
  readonly items: readonly AssessmentSummaryView[];
  readonly heightPx: number;
  readonly emptyTitle: string;
  readonly onOpen: (assessmentId: string) => void;
}
