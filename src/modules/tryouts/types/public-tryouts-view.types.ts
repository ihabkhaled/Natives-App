import type { AsyncViewStatus } from '@/shared/ui';

import type { RegistrationResult } from './tryouts.types';
import type { RegistrationFieldView, TryoutsOption, TryoutsScreenCopy } from './tryouts-view.types';

/**
 * The raw values the public application form collects, before validation and
 * before the optional ones are narrowed to null on the wire. It lives here
 * rather than beside its validators so the types layer never has to import a
 * helper back (which would close an import cycle).
 */
export interface RegistrationDraft {
  readonly tryoutId: string;
  readonly fullName: string;
  readonly preferredName: string;
  readonly email: string;
  readonly phone: string;
  readonly birthYear: string;
  readonly consentGiven: boolean;
}

/**
 * The public screen's local state: the draft the candidate is filling, the
 * server's answer once it lands, and whether the last attempt failed. The
 * three are separate so a failure is never mistaken for a result.
 */
export interface RegistrationDraftState {
  readonly draft: RegistrationDraft;
  readonly result: RegistrationResult | null;
  readonly hasFailed: boolean;
  readonly patch: (change: Partial<RegistrationDraft>) => void;
  readonly onResult: (result: RegistrationResult) => void;
  readonly onFailure: () => void;
  readonly reset: () => void;
}

/**
 * One open tryout session as the public page renders it: the four facts a
 * prospective player actually needs (when, where, places, state) plus the
 * apply affordance. Nothing here exists on the wire that the event DTO does
 * not carry — the capacity meter is derived, never invented.
 */
export interface PublicTryoutCardView {
  readonly id: string;
  readonly name: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly whenLabel: string;
  readonly whenValue: string;
  readonly timeValue: string;
  readonly whereLabel: string;
  readonly whereValue: string;
  readonly placesLabel: string;
  readonly placesValue: string;
  readonly waitlistValue: string | null;
  /** 0–100 fill of the capacity meter; 100 once the session is full. */
  readonly takenPercent: number;
  readonly isFull: boolean;
  readonly isOpen: boolean;
  readonly isSelected: boolean;
  readonly applyLabel: string;
  readonly onApply: () => void;
}

/** One "what happens next" step. Static reassurance copy, not remote data. */
export interface PublicTryoutStepView {
  readonly key: string;
  readonly title: string;
  readonly body: string;
}

/** The application form: labels, field state, the consent gate, and its status. */
export interface RegistrationFormView {
  readonly heading: string;
  readonly intro: string;
  readonly eventLabel: string;
  readonly eventValue: string;
  readonly eventOptions: readonly TryoutsOption[];
  readonly capacityNotice: string | null;
  readonly blockedNotice: string | null;
  readonly nameLabel: string;
  readonly namePlaceholder: string;
  readonly name: RegistrationFieldView;
  readonly preferredLabel: string;
  readonly preferred: RegistrationFieldView;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly email: RegistrationFieldView;
  readonly phoneLabel: string;
  readonly phone: RegistrationFieldView;
  readonly birthYearLabel: string;
  readonly birthYear: RegistrationFieldView;
  readonly consentHeading: string;
  readonly consentStatement: string;
  readonly consentVersionLabel: string;
  readonly consentGiven: boolean;
  readonly consentError: string | null;
  readonly privacyHeading: string;
  readonly privacyNotice: string;
  readonly submitLabel: string;
  readonly isSubmitting: boolean;
  readonly canSubmit: boolean;
  /** Polite live-region text: the in-flight notice or the honest failure. */
  readonly statusMessage: string | null;
  readonly onEventChange: (value: string) => void;
  readonly onConsentChange: (value: boolean) => void;
  readonly onSubmit: () => void;
}

/** The confirmation the candidate sees instead of the form once it lands. */
export interface RegistrationOutcomeView {
  readonly title: string;
  readonly message: string;
  readonly referenceLabel: string;
  readonly reference: string | null;
  readonly tone: string;
  readonly resetLabel: string;
  readonly onReset: () => void;
}

/** The whole public tryouts screen. */
export interface PublicTryoutsView extends TryoutsScreenCopy {
  readonly status: AsyncViewStatus;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly path: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  readonly sessionsHeading: string;
  readonly sessionsIntro: string;
  readonly cards: readonly PublicTryoutCardView[];
  readonly stepsHeading: string;
  readonly steps: readonly PublicTryoutStepView[];
  readonly form: RegistrationFormView;
  readonly outcome: RegistrationOutcomeView | null;
}
