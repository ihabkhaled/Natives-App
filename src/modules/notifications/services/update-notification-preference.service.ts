import { runRequest } from '@/shared/errors';

import { requestUpdateNotificationPreference } from '../gateways/notifications.gateway';
import { mapNotificationPreferences } from '../mappers/notification.mapper';
import type {
  NotificationPreferences,
  UpdatePreferenceCommand,
} from '../types/notifications.types';

/** Use case: flip one category/channel switch and read the matrix back. */
export function updateNotificationPreference(
  command: UpdatePreferenceCommand,
): Promise<NotificationPreferences> {
  return runRequest(async () =>
    mapNotificationPreferences(await requestUpdateNotificationPreference(command)),
  );
}
