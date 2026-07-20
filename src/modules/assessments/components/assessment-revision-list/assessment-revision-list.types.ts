import type { AssessmentRevisionView } from '../../types/assessments-view.types';

export interface AssessmentRevisionListProps {
  readonly title: string;
  readonly emptyLabel: string;
  readonly revisions: readonly AssessmentRevisionView[];
}
