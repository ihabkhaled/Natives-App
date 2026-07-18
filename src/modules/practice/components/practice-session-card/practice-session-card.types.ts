import type { PracticeSessionCardView } from '../../types/practice-view.types';

export interface PracticeSessionCardProps {
  readonly card: PracticeSessionCardView;
  readonly onSelect: (sessionId: string) => void;
}
