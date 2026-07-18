import type { PracticeDaySectionView } from '../../types/practice-view.types';

export interface PracticeDaySectionProps {
  readonly section: PracticeDaySectionView;
  readonly onSelectSession: (sessionId: string) => void;
}
