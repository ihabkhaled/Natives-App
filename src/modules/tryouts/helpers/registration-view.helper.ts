import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { isEventOpen } from './public-tryouts.helper';
import {
  buildRegistrationChrome,
  buildRegistrationFields,
  buildRegistrationLabels,
} from './registration-fields.helper';
import { canSubmitRegistration, type RegistrationDraft } from './registration-form.helper';
import type { TryoutEvent } from '../types/tryouts.types';
import type { RegistrationFormView } from '../types/public-tryouts-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

export interface RegistrationFormInput {
  readonly draft: RegistrationDraft;
  readonly patch: (change: Partial<RegistrationDraft>) => void;
  readonly events: readonly TryoutEvent[];
  readonly selected: TryoutEvent | null;
  readonly isSubmitting: boolean;
  /** True when the last attempt failed; the form stays filled and says so. */
  readonly hasFailed: boolean;
  readonly formatInstant: (iso: string) => string;
  readonly onEventChange: (value: string) => void;
  readonly onConsentChange: (value: boolean) => void;
  readonly onSubmit: () => void;
}

/**
 * The polite live-region text. In flight it announces the wait; after a
 * failure it says nothing was saved, so a candidate never assumes a silent
 * success.
 */
function buildStatusMessage(
  t: Translate,
  isSubmitting: boolean,
  hasFailed: boolean,
): string | null {
  if (isSubmitting) {
    return t(I18N_KEYS.tryouts.publicSubmittingStatus);
  }
  return hasFailed ? t(I18N_KEYS.tryouts.publicSubmitFailed) : null;
}

/** Which session the form is for, or the prompt to pick one. */
function buildIntro(t: Translate, selected: TryoutEvent | null): string {
  return selected === null
    ? t(I18N_KEYS.tryouts.publicSelectPrompt)
    : t(I18N_KEYS.tryouts.publicFormIntro, { event: selected.name });
}

/**
 * The application form bound to the chosen session. A session that is not
 * open is blocked with a reason rather than accepting an application the
 * server would refuse.
 */
export function buildRegistrationFormView(
  t: Translate,
  input: RegistrationFormInput,
): RegistrationFormView {
  const selected = input.selected;
  const isOpen = selected !== null && isEventOpen(selected);
  const effective: RegistrationDraft = { ...input.draft, tryoutId: selected?.tryoutId ?? '' };
  return {
    ...buildRegistrationLabels(t),
    ...buildRegistrationFields(t, input.draft, input.patch),
    ...buildRegistrationChrome(t, {
      events: input.events,
      selected,
      consentGiven: input.draft.consentGiven,
      isSubmitting: input.isSubmitting,
      formatInstant: input.formatInstant,
    }),
    heading: t(I18N_KEYS.tryouts.publicFormHeading),
    intro: buildIntro(t, selected),
    blockedNotice: selected !== null && !isOpen ? t(I18N_KEYS.tryouts.publicClosedNotice) : null,
    isSubmitting: input.isSubmitting,
    canSubmit: isOpen && !input.isSubmitting && canSubmitRegistration(effective),
    statusMessage: buildStatusMessage(t, input.isSubmitting, input.hasFailed),
    onEventChange: input.onEventChange,
    onConsentChange: input.onConsentChange,
    onSubmit: input.onSubmit,
  };
}
