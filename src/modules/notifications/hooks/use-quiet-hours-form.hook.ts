import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { EMPTY_QUIET_HOURS_DRAFT } from '../constants/notifications-route.constants';
import { resolveQuietHoursDraft } from '../helpers/quiet-hours-draft.helper';
import { useQuietHoursMutation } from '../mutations/use-quiet-hours-mutation.hook';
import type { QuietHoursDraft, QuietHoursView } from '../types/notifications-view.types';
import { useQuietHoursQuery } from './use-quiet-hours-query.hook';

/**
 * The quiet-hours form. Local edits shadow the server value until saved, and
 * an invalid wall-clock time blocks the save rather than being sent and
 * rejected.
 */
export function useQuietHoursForm(): QuietHoursView {
  const { t } = useAppTranslation();
  const toast = useAppToast();
  const query = useQuietHoursQuery();
  const [draft, setDraft] = useState<QuietHoursDraft>(EMPTY_QUIET_HOURS_DRAFT);
  const mutation = useQuietHoursMutation({
    onSuccess: () => {
      setDraft(EMPTY_QUIET_HOURS_DRAFT);
      void toast.showToast({
        message: t(I18N_KEYS.notifications.quietHoursSavedToast),
        tone: 'success',
      });
    },
    onError: () => {
      void toast.showToast({
        message: t(I18N_KEYS.notifications.preferenceFailedToast),
        tone: 'danger',
      });
    },
  });

  const resolved = resolveQuietHoursDraft(draft, query.data);
  const { startsLocal, endsLocal, urgent, isValid } = resolved;

  return {
    heading: t(I18N_KEYS.notifications.quietHoursHeading),
    intro: t(I18N_KEYS.notifications.quietHoursIntro),
    startLabel: t(I18N_KEYS.notifications.quietHoursStart),
    startValue: startsLocal,
    endLabel: t(I18N_KEYS.notifications.quietHoursEnd),
    endValue: endsLocal,
    timezoneLabel: t(I18N_KEYS.notifications.quietHoursTimezone),
    timezoneValue: resolved.timezone,
    urgentLabel: t(I18N_KEYS.notifications.quietHoursUrgentLabel),
    urgentNote: t(I18N_KEYS.notifications.quietHoursUrgentNote),
    urgentEnabled: urgent,
    validationMessage: isValid ? null : t(I18N_KEYS.notifications.quietHoursInvalid),
    saveLabel: t(I18N_KEYS.notifications.quietHoursSave),
    isSaving: mutation.isRunning,
    onStartChange: (value: string) => {
      setDraft((current) => ({ ...current, startsLocal: value }));
    },
    onEndChange: (value: string) => {
      setDraft((current) => ({ ...current, endsLocal: value }));
    },
    onUrgentChange: (value: boolean) => {
      setDraft((current) => ({ ...current, urgent: value }));
    },
    onSave: () => {
      if (isValid) {
        mutation.run({
          timezone: resolved.timezone,
          startsLocal,
          endsLocal,
          urgentCancellationOverride: urgent,
        });
      }
    },
  };
}
