import { runRequest } from '@/shared/errors';

import { requestMarkNotificationRead } from '../gateways/notifications.gateway';
import { mapNotification } from '../mappers/notification.mapper';
import type { NotificationItem } from '../types/notifications.types';

/** Use case: mark one notification read. Idempotent by contract. */
export function markNotificationRead(notificationId: string): Promise<NotificationItem> {
  return runRequest(async () => mapNotification(await requestMarkNotificationRead(notificationId)));
}
