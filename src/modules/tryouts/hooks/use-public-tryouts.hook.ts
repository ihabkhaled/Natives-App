import { formatCairoTime, formatCairoWeekdayDate } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { useNetworkStatus } from '@/platform';
import { I18N_KEYS } from '@/shared/i18n';
import { resolveAsyncViewStatus } from '@/shared/view';

import { CONSENT_VERSION } from '../constants/tryouts.constants';
import {
  buildPublicTryoutCard,
  buildPublicTryoutSteps,
  selectPublicEvent,
} from '../helpers/public-tryouts.helper';
import {
  buildRegistrationResultView,
  orNull,
  parseBirthYear,
} from '../helpers/registration-form.helper';
import { buildRegistrationFormView } from '../helpers/registration-view.helper';
import { buildTryoutsScreenCopy } from '../helpers/tryouts-copy.helper';
import { useRegisterCandidateMutation } from '../mutations/use-register-candidate-mutation.hook';
import { tryoutRegistrationPath } from '../routes/tryouts.paths';
import type { PublicTryoutsView } from '../types/public-tryouts-view.types';
import { usePublicTryoutEventsQuery } from './use-public-tryout-events-query.hook';
import { useRegistrationDraft } from './use-registration-draft.hook';

/**
 * The public tryouts screen: the open sessions anyone may browse, and the
 * application form bound to the session they pick. No session is required and
 * nothing here reads team-scoped data. Instants are rendered in Africa/Cairo
 * through the date facade, and consent travels with the version the candidate
 * actually saw.
 */
export function usePublicTryouts(): PublicTryoutsView {
  const { t, locale } = useAppTranslation();
  const network = useNetworkStatus();
  const state = useRegistrationDraft();
  const events = usePublicTryoutEventsQuery();
  const items = events.data?.items ?? [];
  const selected = selectPublicEvent(items, state.draft.tryoutId);
  const registration = useRegisterCandidateMutation({
    onResult: state.onResult,
    onFailure: state.onFailure,
  });

  return {
    ...buildTryoutsScreenCopy(t, {
      error: events.error,
      isOffline: !network.isOnline,
      onRetry: events.refetch,
      emptyTitleKey: I18N_KEYS.tryouts.publicEmptyTitle,
      emptyMessageKey: I18N_KEYS.tryouts.publicEmptyMessage,
    }),
    status: resolveAsyncViewStatus({
      isForbidden: false,
      isLoading: events.isLoading,
      hasError: events.error !== null,
      isOffline: !network.isOnline,
      hasData: events.data !== undefined,
      hasItems: items.length > 0,
    }),
    seoTitle: t(I18N_KEYS.tryouts.publicSeoTitle),
    seoDescription: t(I18N_KEYS.tryouts.publicSeoDescription),
    path: tryoutRegistrationPath(),
    eyebrow: t(I18N_KEYS.tryouts.publicEyebrow),
    title: t(I18N_KEYS.tryouts.publicHeroTitle),
    intro: t(I18N_KEYS.tryouts.publicHeroIntro),
    sessionsHeading: t(I18N_KEYS.tryouts.publicSessionsHeading),
    sessionsIntro: t(I18N_KEYS.tryouts.publicSessionsIntro),
    cards: items.map((event) =>
      buildPublicTryoutCard(t, {
        event,
        selectedId: selected?.tryoutId ?? '',
        formatDay: (iso: string) => formatCairoWeekdayDate(iso, locale),
        formatTime: (iso: string) => formatCairoTime(iso, locale),
        onApply: (tryoutId: string) => {
          state.patch({ tryoutId });
        },
      }),
    ),
    stepsHeading: t(I18N_KEYS.tryouts.publicStepsHeading),
    steps: buildPublicTryoutSteps(t),
    form: buildRegistrationFormView(t, {
      draft: state.draft,
      patch: state.patch,
      events: items,
      selected,
      isSubmitting: registration.isRunning,
      hasFailed: state.hasFailed,
      formatInstant: (iso: string) => formatCairoWeekdayDate(iso, locale),
      onEventChange: (tryoutId: string) => {
        state.patch({ tryoutId });
      },
      onConsentChange: (consentGiven: boolean) => {
        state.patch({ consentGiven });
      },
      onSubmit: () => {
        registration.run({
          tryoutId: selected?.tryoutId ?? '',
          fullName: state.draft.fullName.trim(),
          preferredName: orNull(state.draft.preferredName),
          email: state.draft.email.trim(),
          phone: orNull(state.draft.phone),
          birthYear: parseBirthYear(state.draft.birthYear),
          consentVersion: selected?.consentVersion ?? CONSENT_VERSION,
          consentGiven: state.draft.consentGiven,
        });
      },
    }),
    outcome: buildRegistrationResultView(t, state.result, state.reset),
  };
}
