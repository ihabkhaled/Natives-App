import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { CONSENT_VERSION } from '../constants/tryouts.constants';
import type { TryoutEvent } from '../types/tryouts.types';
import type { RegistrationFieldView, TryoutsOption } from '../types/tryouts-view.types';
import {
  fieldError,
  isBirthYearValid,
  isEmailValid,
  isNameValid,
  type RegistrationDraft,
} from './registration-form.helper';

type Translate = (key: string, params?: TranslateParams) => string;

/** The five collected fields, resolved once so the hook stays a composition. */
export interface RegistrationFieldSet {
  readonly name: RegistrationFieldView;
  readonly preferred: RegistrationFieldView;
  readonly email: RegistrationFieldView;
  readonly phone: RegistrationFieldView;
  readonly birthYear: RegistrationFieldView;
}

/** One field: its current value, its error (if any), and its writer. */
function field(
  value: string,
  errorMessage: string | null,
  write: (next: string) => void,
): RegistrationFieldView {
  return { value, errorMessage, onChange: write };
}

export function buildRegistrationFields(
  t: Translate,
  draft: RegistrationDraft,
  patch: (change: Partial<RegistrationDraft>) => void,
): RegistrationFieldSet {
  const nameError = fieldError(
    t,
    draft.fullName,
    isNameValid(draft.fullName),
    I18N_KEYS.tryouts.validationNameRequired,
  );
  const emailError = fieldError(
    t,
    draft.email,
    isEmailValid(draft.email),
    I18N_KEYS.tryouts.validationEmailInvalid,
  );
  const birthYearError = fieldError(
    t,
    draft.birthYear,
    isBirthYearValid(draft.birthYear),
    I18N_KEYS.tryouts.validationBirthYearInvalid,
  );
  return {
    name: field(draft.fullName, nameError, (value) => {
      patch({ fullName: value });
    }),
    preferred: field(draft.preferredName, null, (value) => {
      patch({ preferredName: value });
    }),
    email: field(draft.email, emailError, (value) => {
      patch({ email: value });
    }),
    phone: field(draft.phone, null, (value) => {
      patch({ phone: value });
    }),
    birthYear: field(draft.birthYear, birthYearError, (value) => {
      patch({ birthYear: value });
    }),
  };
}

/** Everything about the chosen event and the consent gate. */
export interface RegistrationChrome {
  readonly eventValue: string;
  readonly eventOptions: readonly TryoutsOption[];
  readonly capacityNotice: string | null;
  readonly consentVersionLabel: string;
  readonly consentGiven: boolean;
  readonly consentError: string | null;
  readonly submitLabel: string;
}

export interface RegistrationChromeInput {
  readonly events: readonly TryoutEvent[];
  readonly selected: TryoutEvent | null;
  readonly consentGiven: boolean;
  readonly isSubmitting: boolean;
  readonly formatInstant: (iso: string) => string;
}

/**
 * The event picker plus the consent gate. A full session says so rather than
 * silently accepting a registration it cannot honour.
 */
export function buildRegistrationChrome(
  t: Translate,
  input: RegistrationChromeInput,
): RegistrationChrome {
  const selected = input.selected;
  const isFull = selected !== null && selected.registeredCount >= selected.capacity;
  return {
    eventValue: selected?.tryoutId ?? '',
    eventOptions: input.events.map((item) => ({
      value: item.tryoutId,
      label: `${item.name} — ${input.formatInstant(item.heldAt)}`,
    })),
    capacityNotice: isFull ? t(I18N_KEYS.tryouts.capacityFullNotice) : null,
    consentVersionLabel: t(I18N_KEYS.tryouts.consentVersionLabel, { version: CONSENT_VERSION }),
    consentGiven: input.consentGiven,
    consentError: input.consentGiven ? null : t(I18N_KEYS.tryouts.consentRequired),
    submitLabel: input.isSubmitting
      ? t(I18N_KEYS.tryouts.registrationSubmitting)
      : t(I18N_KEYS.tryouts.registrationSubmit),
  };
}

/** The static labels the registration form renders. */
export interface RegistrationLabels {
  readonly nameLabel: string;
  readonly namePlaceholder: string;
  readonly preferredLabel: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly phoneLabel: string;
  readonly birthYearLabel: string;
  readonly consentHeading: string;
  readonly consentStatement: string;
  readonly privacyHeading: string;
  readonly privacyNotice: string;
  readonly eventLabel: string;
}

export function buildRegistrationLabels(t: Translate): RegistrationLabels {
  return {
    nameLabel: t(I18N_KEYS.tryouts.registrationNameLabel),
    namePlaceholder: t(I18N_KEYS.tryouts.registrationNamePlaceholder),
    preferredLabel: t(I18N_KEYS.tryouts.registrationPreferredLabel),
    emailLabel: t(I18N_KEYS.tryouts.registrationEmailLabel),
    emailPlaceholder: t(I18N_KEYS.tryouts.registrationEmailPlaceholder),
    phoneLabel: t(I18N_KEYS.tryouts.registrationPhoneLabel),
    birthYearLabel: t(I18N_KEYS.tryouts.registrationBirthYearLabel),
    consentHeading: t(I18N_KEYS.tryouts.consentHeading),
    consentStatement: t(I18N_KEYS.tryouts.consentStatement),
    privacyHeading: t(I18N_KEYS.tryouts.privacyHeading),
    privacyNotice: t(I18N_KEYS.tryouts.privacyNotice),
    eventLabel: t(I18N_KEYS.tryouts.registrationEventLabel),
  };
}
