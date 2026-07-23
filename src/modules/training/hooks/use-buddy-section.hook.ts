import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { buildBuddySection } from '../helpers/buddy-view.helper';
import { useBuddyResponseMutation } from '../mutations/use-buddy-response-mutation.hook';
import type { BuddySectionView } from '../types/training-buddy-view.types';
import { useMyBuddiesQuery } from './use-my-buddies-query.hook';

/**
 * The badge-counted buddy-confirmations section: the caller's credit page,
 * one confirm/decline mutation with per-intent toasts, and the prepared view.
 */
export function useBuddySection(teamId: string): BuddySectionView {
  const { t, locale } = useAppTranslation();
  const toast = useAppToast();
  const buddies = useMyBuddiesQuery(teamId);
  const [intent, setIntent] = useState<'confirm' | 'decline'>('confirm');
  const response = useBuddyResponseMutation(teamId, {
    onSuccess: () => {
      void toast.showToast({
        message: t(
          intent === 'confirm'
            ? I18N_KEYS.training.buddyConfirmedToast
            : I18N_KEYS.training.buddyDeclinedToast,
        ),
        tone: 'success',
      });
    },
    onError: () => {
      void toast.showToast({ message: t(I18N_KEYS.training.actionFailedToast), tone: 'danger' });
    },
  });

  return buildBuddySection({
    t,
    locale,
    page: buddies.data,
    isLoading: buddies.isLoading,
    error: buddies.error,
    busyBuddyId: response.busyBuddyId,
    busyIntent: response.lastIntent,
    onConfirm: (buddyId) => {
      setIntent('confirm');
      response.respond({ buddyId, intent: 'confirm' });
    },
    onDecline: (buddyId) => {
      setIntent('decline');
      response.respond({ buddyId, intent: 'decline' });
    },
  });
}
