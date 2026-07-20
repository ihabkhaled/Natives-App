import { useState } from 'react';

import { formatCairoDateTime } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useNetworkStatus } from '@/platform';
import { I18N_KEYS } from '@/shared/i18n';
import { resolveAsyncViewStatus } from '@/shared/view';

import { CONSENT_VERSION } from '../constants/tryouts.constants';
import {
  buildRegistrationChrome,
  buildRegistrationFields,
  buildRegistrationLabels,
} from '../helpers/registration-fields.helper';
import {
  buildRegistrationResultView,
  canSubmitRegistration,
  EMPTY_REGISTRATION_DRAFT,
  orNull,
  parseBirthYear,
  type RegistrationDraft,
} from '../helpers/registration-form.helper';
import { buildTryoutsScreenCopy } from '../helpers/tryouts-copy.helper';
import { useRegisterCandidateMutation } from '../mutations/use-register-candidate-mutation.hook';
import type { RegistrationResult } from '../types/tryouts.types';
import type { TryoutRegistrationView } from '../types/tryouts-view.types';
import { usePublicTryoutEventsQuery } from './use-public-tryout-events-query.hook';

/**
 * The public candidate registration screen. Consent is explicit: the form
 * cannot be submitted without it, and the accepted version travels with the
 * request so the record is auditable.
 */
export function useTryoutRegistration(): TryoutRegistrationView {
  const { t, locale } = useAppTranslation();
  const network = useNetworkStatus();
  const [draft, setDraft] = useState<RegistrationDraft>(EMPTY_REGISTRATION_DRAFT);
  const [result, setResult] = useState<RegistrationResult | null>(null);

  const events = usePublicTryoutEventsQuery();
  const items = events.data?.items ?? [];
  const selected = items.find((item) => item.tryoutId === draft.tryoutId) ?? items[0] ?? null;
  const registration = useRegisterCandidateMutation(setResult);

  const patch = (change: Partial<RegistrationDraft>): void => {
    setDraft((current) => ({ ...current, ...change }));
  };
  const effectiveDraft: RegistrationDraft = { ...draft, tryoutId: selected?.tryoutId ?? '' };
  const screenStatus = resolveAsyncViewStatus({
    isForbidden: false,
    isLoading: events.isLoading,
    hasError: events.error !== null,
    isOffline: !network.isOnline,
    hasData: events.data !== undefined,
    hasItems: items.length > 0,
  });

  return {
    ...buildTryoutsScreenCopy(t, {
      error: events.error,
      isOffline: !network.isOnline,
      onRetry: events.refetch,
      emptyTitleKey: I18N_KEYS.tryouts.emptyTitle,
      emptyMessageKey: I18N_KEYS.tryouts.emptyMessage,
    }),
    ...buildRegistrationLabels(t),
    ...buildRegistrationFields(t, draft, patch),
    ...buildRegistrationChrome(t, {
      events: items,
      selected,
      consentGiven: draft.consentGiven,
      isSubmitting: registration.isRunning,
      formatInstant: (iso: string) => formatCairoDateTime(iso, locale),
    }),
    title: t(I18N_KEYS.tryouts.registrationTitle),
    intro: t(I18N_KEYS.tryouts.registrationIntro),
    status: screenStatus,
    backendPendingNotice: t(I18N_KEYS.tryouts.backendPendingNotice),
    isSubmitting: registration.isRunning,
    canSubmit: canSubmitRegistration(effectiveDraft) && !registration.isRunning,
    result: buildRegistrationResultView(t, result),
    onEventChange: (value: string) => {
      patch({ tryoutId: value });
    },
    onConsentChange: (value: boolean) => {
      patch({ consentGiven: value });
    },
    onSubmit: () => {
      registration.run({
        tryoutId: effectiveDraft.tryoutId,
        fullName: draft.fullName.trim(),
        preferredName: orNull(draft.preferredName),
        email: draft.email.trim(),
        phone: orNull(draft.phone),
        birthYear: parseBirthYear(draft.birthYear),
        consentVersion: CONSENT_VERSION,
        consentGiven: draft.consentGiven,
      });
    },
  };
}
