import type { SubmissionSummaryView } from '../../types/training-view.types';

export interface TrainingSubmissionListProps {
  readonly items: readonly SubmissionSummaryView[];
  readonly onOpen: (submissionId: string) => void;
}
