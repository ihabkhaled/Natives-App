import { useState } from 'react';

import { useEffectivePermissions } from '@/modules/auth';
import { nowIso } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { openExternalUrl, useNetworkStatus } from '@/platform';
import { APP_ERROR_CODE } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';
import { useAppToast } from '@/shared/ui';

import { type RsvpReason } from '../constants/practice.constants';
import { buildPracticeSessionScreenView } from '../helpers/practice-session-screen.helper';
import { useRsvpMutation } from '../mutations/use-rsvp-mutation.hook';
import { usePracticeSessionQuery } from './use-practice-session-query.hook';
import type { PracticeSessionScreenView } from '../types/practice-view.types';

/** Prepared, translated session-detail screen with the self-RSVP flow. */
export function usePracticeSessionDetails(sessionId: string): PracticeSessionScreenView {
  const { t, locale } = useAppTranslation();
  const network = useNetworkStatus();
  const permissions = useEffectivePermissions();
  const query = usePracticeSessionQuery(sessionId);
  const toast = useAppToast();
  const [reason, setReason] = useState<RsvpReason | null>(null);
  const mutation = useRsvpMutation(sessionId, {
    onSuccess: () => {
      void toast.showToast({ message: t(I18N_KEYS.practice.rsvpUpdatedToast), tone: 'success' });
    },
    onError: (error) => {
      const key =
        error.code === APP_ERROR_CODE.Conflict
          ? I18N_KEYS.practice.rsvpConflict
          : I18N_KEYS.practice.rsvpErrorToast;
      void toast.showToast({ message: t(key), tone: 'danger' });
    },
  });
  const detail = query.session;

  return buildPracticeSessionScreenView({
    t,
    locale,
    detail,
    isLoading: query.isLoading,
    error: query.error,
    isOffline: !network.isOnline,
    now: nowIso(),
    canRsvpSelf: hasAllPermissions(permissions.permissions, [PERMISSIONS.practicesRsvpSelf]),
    selectedReason: reason,
    isSubmitting: mutation.isSubmitting,
    isConflict: mutation.isConflict,
    onRetry: query.refetch,
    onSelectReason: setReason,
    onSubmitRsvp: (status) => {
      mutation.submit({ status, reasonCategory: reason, version: detail?.rsvp.version ?? 0 });
    },
    onOpenMap: (url) => {
      void openExternalUrl(url).catch(() => undefined);
    },
  });
}
