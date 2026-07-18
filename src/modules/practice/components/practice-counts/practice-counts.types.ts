import type { PracticeCountView } from '../../types/practice-view.types';

export interface PracticeCountsProps {
  readonly heading: string;
  readonly counts: readonly PracticeCountView[] | null;
  readonly privateLabel: string;
}
