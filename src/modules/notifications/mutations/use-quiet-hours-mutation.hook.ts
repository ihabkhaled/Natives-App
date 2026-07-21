import { useInvalidatingMutation } from '@/packages/query';

import { notificationsQueryKeys } from '../queries/notifications.keys';
import { updateQuietHours } from '../services/update-quiet-hours.service';
import type {
  NotificationsMutationCallbacks,
  QuietHoursMutationView,
} from '../types/mutation.types';
import type { QuietHours } from '../types/notifications.types';

/** Save the quiet-hours window and whether urgent notices may break it. */
export function useQuietHoursMutation(
  callbacks: NotificationsMutationCallbacks,
): QuietHoursMutationView {
  return useInvalidatingMutation<QuietHours, QuietHours>({
    mutationFn: (command) => updateQuietHours(command),
    invalidateKey: notificationsQueryKeys.quietHours(),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
