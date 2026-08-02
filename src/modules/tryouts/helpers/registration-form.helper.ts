import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { TRYOUT_LIMITS } from '../constants/tryouts.constants';
import type { RegistrationResult } from '../types/tryouts.types';
import type {
  RegistrationDraft,
  RegistrationOutcomeView,
} from '../types/public-tryouts-view.types';

// The draft type is part of this helper's API surface — EMPTY_REGISTRATION_DRAFT
// and canSubmitRegistration are both expressed in terms of it — so callers get
// it from here rather than reaching into the types module separately.
export type { RegistrationDraft };

type Translate = (key: string, params?: TranslateParams) => string;

export const EMPTY_REGISTRATION_DRAFT: RegistrationDraft = {
  tryoutId: '',
  fullName: '',
  preferredName: '',
  email: '',
  phone: '',
  birthYear: '',
  consentGiven: false,
};

/** One side of an address. Split-then-test avoids a backtracking pattern. */
const EMAIL_PART = /^[^\s@]+$/u;

export function isNameValid(fullName: string): boolean {
  return fullName.trim().length > 0;
}

export function isEmailValid(email: string): boolean {
  const trimmed = email.trim();
  const at = trimmed.indexOf('@');
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  return at > 0 && EMAIL_PART.test(local) && EMAIL_PART.test(domain) && domain.includes('.');
}

/**
 * An empty birth year is allowed (the field is optional). A typed value must
 * be a plausible four-digit year — never silently coerced to 0.
 */
export function isBirthYearValid(birthYear: string): boolean {
  if (birthYear.trim() === '') {
    return true;
  }
  const parsed = Number.parseInt(birthYear.trim(), 10);
  return (
    Number.isInteger(parsed) &&
    parsed >= TRYOUT_LIMITS.earliestBirthYear &&
    parsed <= TRYOUT_LIMITS.latestBirthYear
  );
}

export function parseBirthYear(birthYear: string): number | null {
  return birthYear.trim() === '' ? null : Number.parseInt(birthYear.trim(), 10);
}

/** Empty optional text is null on the wire, never an empty string. */
export function orNull(value: string): string | null {
  return value.trim() === '' ? null : value.trim();
}

/** Consent is mandatory: no consent, no submission. */
export function canSubmitRegistration(draft: RegistrationDraft): boolean {
  return (
    draft.tryoutId !== '' &&
    draft.consentGiven &&
    isNameValid(draft.fullName) &&
    isEmailValid(draft.email) &&
    isBirthYearValid(draft.birthYear)
  );
}

/** Field errors surface only once the candidate has typed something. */
export function fieldError(
  t: Translate,
  value: string,
  isValid: boolean,
  key: string,
): string | null {
  return value.trim() !== '' && !isValid ? t(key) : null;
}

/**
 * Every outcome the server can report gets its own honest copy and tone: a
 * duplicate is not dressed up as a success, and a waitlist placement says so
 * rather than implying a confirmed place.
 */
const OUTCOME_COPY = {
  registered: {
    title: I18N_KEYS.tryouts.registeredTitle,
    message: I18N_KEYS.tryouts.registeredMessage,
    tone: 'success',
  },
  waitlisted: {
    title: I18N_KEYS.tryouts.waitlistedTitle,
    message: I18N_KEYS.tryouts.waitlistedMessage,
    tone: 'warning',
  },
  duplicate: {
    title: I18N_KEYS.tryouts.duplicateTitle,
    message: I18N_KEYS.tryouts.duplicateMessage,
    tone: 'medium',
  },
} as const;

export function buildRegistrationResultView(
  t: Translate,
  result: RegistrationResult | null,
  onReset: () => void,
): RegistrationOutcomeView | null {
  if (result === null) {
    return null;
  }
  const copy = OUTCOME_COPY[result.outcome];
  return {
    title: t(copy.title),
    message: t(copy.message),
    referenceLabel: t(I18N_KEYS.tryouts.referenceLabel),
    reference: result.reference,
    tone: copy.tone,
    resetLabel: t(I18N_KEYS.tryouts.publicApplyAnother),
    onReset,
  };
}
