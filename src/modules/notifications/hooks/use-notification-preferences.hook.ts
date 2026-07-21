import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import { buildPreferenceRows } from '../helpers/preference-view.helper';
import {
  buildNotificationsScreenCopy,
  resolveNotificationsScreenStatus,
} from '../helpers/notifications-copy.helper';
import { usePreferenceMutation } from '../mutations/use-preference-mutation.hook';
import { notificationsPagePath } from '../routes/notifications.paths';
import type { NotificationPreferencesView } from '../types/notifications-view.types';
import { useNotificationPreferencesQuery } from './use-notification-preferences-query.hook';
import { useNotificationsContext } from './use-notifications-context.hook';
import { useQuietHoursForm } from './use-quiet-hours-form.hook';

/**
 * Prepared, translated view model for the preference screen. Mandatory rows
 * render as locked switches with a stated reason — the UI never accepts a
 * change the backend would silently discard.
 */
export function useNotificationPreferences(): NotificationPreferencesView {
  const { t } = useAppTranslation();
  const context = useNotificationsContext();
  const navigation = useAppNavigation();
  const toast = useAppToast();
  const query = useNotificationPreferencesQuery();
  const preference = usePreferenceMutation({
    onSuccess: () => {
      void toast.showToast({
        message: t(I18N_KEYS.notifications.preferenceSavedToast),
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
  const quietHours = useQuietHoursForm();
  const items = query.data?.items ?? [];

  return {
    ...buildNotificationsScreenCopy(t, {
      error: query.error,
      isOffline: context.isOffline,
      onRetry: query.refetch,
      emptyTitleKey: I18N_KEYS.notifications.preferencesEmptyTitle,
      emptyMessageKey: I18N_KEYS.notifications.preferencesEmptyMessage,
    }),
    title: t(I18N_KEYS.notifications.preferencesTitle),
    subtitle: t(I18N_KEYS.notifications.preferencesSubtitle),
    status: resolveNotificationsScreenStatus(context, query, true, query.data !== undefined),
    matrixHeading: t(I18N_KEYS.notifications.channelsHeading),
    matrixIntro: t(I18N_KEYS.notifications.channelsIntro),
    mandatoryNotice: t(I18N_KEYS.notifications.mandatoryNotice),
    rows: buildPreferenceRows(t, items, preference.run),
    scopeHeading: t(I18N_KEYS.notifications.teamScopeHeading),
    scopeNote: t(I18N_KEYS.notifications.teamScopeNote, {
      team:
        context.teamName === '' ? t(I18N_KEYS.notifications.teamScopeUnknown) : context.teamName,
    }),
    quietHours,
    backLabel: t(I18N_KEYS.notifications.linkBack),
    onBack: () => {
      navigation.push(notificationsPagePath());
    },
  };
}
