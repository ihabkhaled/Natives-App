import type { RsvpRecord } from '../types/practice-rsvp-detail.types';

/** Which session an override mutation acts on. */
export interface RsvpOverrideMutationScope {
  readonly teamId: string;
  readonly sessionId: string;
}

/** The override reports the record it produced, so the screen can confirm the new answer. */
export interface RsvpOverrideCallbacks {
  readonly onSuccess: (result: RsvpRecord) => void;
  readonly onError: (error: unknown) => void;
}

export interface RsvpOverrideMutationView {
  readonly isSubmitting: boolean;
}
