import { useInvalidatingMutation } from '@/packages/query';

import { notificationsQueryKeys } from '../queries/notifications.keys';
import { markNotificationRead } from '../services/mark-notification-read.service';
import type { MarkReadMutationView, NotificationsMutationCallbacks } from '../types/mutation.types';
import type { NotificationItem } from '../types/notifications.types';

/** Mark one notification read. Safe to repeat: the contract is idempotent. */
export function useMarkReadMutation(
  callbacks: NotificationsMutationCallbacks,
): MarkReadMutationView {
  return useInvalidatingMutation<NotificationItem, string>({
    mutationFn: (notificationId) => markNotificationRead(notificationId),
    invalidateKey: notificationsQueryKeys.all,
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
