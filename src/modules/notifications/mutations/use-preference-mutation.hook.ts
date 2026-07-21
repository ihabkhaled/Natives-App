import { useInvalidatingMutation } from '@/packages/query';

import { notificationsQueryKeys } from '../queries/notifications.keys';
import { updateNotificationPreference } from '../services/update-notification-preference.service';
import type {
  NotificationsMutationCallbacks,
  PreferenceMutationView,
} from '../types/mutation.types';
import type {
  NotificationPreferences,
  UpdatePreferenceCommand,
} from '../types/notifications.types';

/** Flip one category/channel switch. Mandatory rows never reach this hook. */
export function usePreferenceMutation(
  callbacks: NotificationsMutationCallbacks,
): PreferenceMutationView {
  return useInvalidatingMutation<NotificationPreferences, UpdatePreferenceCommand>({
    mutationFn: (command) => updateNotificationPreference(command),
    invalidateKey: notificationsQueryKeys.preferences(),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
