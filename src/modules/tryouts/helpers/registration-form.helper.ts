import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { TRYOUT_LIMITS } from '../constants/tryouts.constants';
import type { RegistrationResult } from '../types/tryouts.types';
import type { RegistrationResultView } from '../types/tryouts-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The raw values the public registration form collects. */
export interface RegistrationDraft {
  readonly tryoutId: string;
  readonly fullName: string;
  readonly preferredName: string;
  readonly email: string;
  readonly phone: string;
  readonly birthYear: string;
  readonly consentGiven: boolean;
}

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

const OUTCOME_COPY = {
  registered: {
    title: I18N_KEYS.tryouts.registeredTitle,
    message: I18N_KEYS.tryouts.registeredMessage,
  },
  waitlisted: {
    title: I18N_KEYS.tryouts.waitlistedTitle,
    message: I18N_KEYS.tryouts.waitlistedMessage,
  },
  duplicate: {
    title: I18N_KEYS.tryouts.duplicateTitle,
    message: I18N_KEYS.tryouts.duplicateMessage,
  },
} as const;

export function buildRegistrationResultView(
  t: Translate,
  result: RegistrationResult | null,
): RegistrationResultView | null {
  if (result === null) {
    return null;
  }
  const copy = OUTCOME_COPY[result.outcome];
  return {
    title: t(copy.title),
    message: t(copy.message),
    referenceLabel: t(I18N_KEYS.tryouts.referenceLabel),
    reference: result.reference,
  };
}
