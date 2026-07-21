import { runRequest } from '@/shared/errors';

import { requestNotificationPreferences } from '../gateways/notifications.gateway';
import { mapNotificationPreferences } from '../mappers/notification.mapper';
import type { NotificationPreferences } from '../types/notifications.types';

/** Use case: the caller's category/channel preference matrix. */
export function getNotificationPreferences(): Promise<NotificationPreferences> {
  return runRequest(async () => mapNotificationPreferences(await requestNotificationPreferences()));
}
