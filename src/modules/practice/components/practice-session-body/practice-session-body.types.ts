import type { RsvpReason, RsvpStatus } from '../../constants/practice.constants';
import type { PracticeSessionDetailData } from '../../types/practice-view.types';

export interface PracticeSessionBodyProps {
  readonly detail: PracticeSessionDetailData;
  readonly isOffline: boolean;
  readonly offlineNoticeLabel: string;
  readonly selectedReason: RsvpReason | null;
  readonly isSubmitting: boolean;
  readonly conflictNote: string | null;
  readonly onSelectReason: (reason: RsvpReason | null) => void;
  readonly onSubmitRsvp: (status: RsvpStatus) => void;
  readonly onOpenMap: (url: string) => void;
}
