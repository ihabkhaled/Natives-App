import type { FeedbackCardView } from '../../types/assessments-view.types';

export interface CoachFeedbackPanelProps {
  readonly title: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly cards: readonly FeedbackCardView[];
  readonly isAcknowledging: boolean;
  readonly onAcknowledge: (feedbackId: string, clarificationRequested: boolean) => void;
}
