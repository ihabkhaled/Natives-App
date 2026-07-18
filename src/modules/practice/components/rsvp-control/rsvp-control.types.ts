import type { RsvpReason, RsvpStatus } from '../../constants/practice.constants';
import type { RsvpControlData } from '../../types/practice-view.types';

export interface RsvpControlProps {
  readonly data: RsvpControlData;
  readonly selectedReason: RsvpReason | null;
  readonly isSubmitting: boolean;
  readonly conflictNote: string | null;
  readonly onSelectReason: (reason: RsvpReason | null) => void;
  readonly onSubmit: (status: RsvpStatus) => void;
}
