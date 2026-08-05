import type { PracticeSessionScreenView } from '../../types/practice-view.types';

export interface SessionCtaListProps {
  readonly attendanceCta: PracticeSessionScreenView['attendanceCta'];
  readonly remindersCta: PracticeSessionScreenView['remindersCta'];
}
