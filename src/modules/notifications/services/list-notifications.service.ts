import { runRequest } from '@/shared/errors';

import { requestNotifications } from '../gateways/notifications.gateway';
import { mapNotificationPage } from '../mappers/notification.mapper';
import type { NotificationPage } from '../types/notifications.types';

/** Use case: one bounded page of the caller's own inbox. */
export function listNotifications(limit: number, offset: number): Promise<NotificationPage> {
  return runRequest(async () => mapNotificationPage(await requestNotifications(limit, offset)));
}
