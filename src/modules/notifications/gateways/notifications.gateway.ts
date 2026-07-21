import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  notificationPreferencesPath,
  notificationQuietHoursPath,
  notificationReadPath,
  notificationsPath,
} from '../constants/notifications-api.constants';
import {
  notificationListResponseSchema,
  notificationPreferencesResponseSchema,
  notificationResponseSchema,
  quietHoursResponseSchema,
} from '../schemas/notification.schema';
import type { QuietHours, UpdatePreferenceCommand } from '../types/notifications.types';

type NotificationListDto = SchemaOutput<typeof notificationListResponseSchema>;
type NotificationDto = SchemaOutput<typeof notificationResponseSchema>;
type PreferencesDto = SchemaOutput<typeof notificationPreferencesResponseSchema>;
type QuietHoursDto = SchemaOutput<typeof quietHoursResponseSchema>;

/** One bounded page of the caller's own inbox. */
export function requestNotifications(limit: number, offset: number): Promise<NotificationListDto> {
  return getAppHttpClient().get(notificationsPath(), notificationListResponseSchema, {
    params: { limit, offset },
  });
}

/** Marking read is idempotent: a second call returns the same read instant. */
export function requestMarkNotificationRead(notificationId: string): Promise<NotificationDto> {
  return getAppHttpClient().post(
    notificationReadPath(notificationId),
    {},
    notificationResponseSchema,
  );
}

export function requestNotificationPreferences(): Promise<PreferencesDto> {
  return getAppHttpClient().get(
    notificationPreferencesPath(),
    notificationPreferencesResponseSchema,
  );
}

export function requestUpdateNotificationPreference(
  command: UpdatePreferenceCommand,
): Promise<PreferencesDto> {
  return getAppHttpClient().put(
    notificationPreferencesPath(),
    { category: command.category, channel: command.channel, enabled: command.enabled },
    notificationPreferencesResponseSchema,
  );
}

export function requestQuietHours(): Promise<QuietHoursDto> {
  return getAppHttpClient().get(notificationQuietHoursPath(), quietHoursResponseSchema);
}

export function requestUpdateQuietHours(command: QuietHours): Promise<QuietHoursDto> {
  return getAppHttpClient().put(
    notificationQuietHoursPath(),
    {
      timezone: command.timezone,
      startsLocal: command.startsLocal,
      endsLocal: command.endsLocal,
      urgentCancellationOverride: command.urgentCancellationOverride,
    },
    quietHoursResponseSchema,
  );
}
