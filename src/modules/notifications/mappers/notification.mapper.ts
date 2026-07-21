import type { SchemaOutput } from '@/packages/schema';

import type {
  notificationListResponseSchema,
  notificationPreferencesResponseSchema,
  notificationResponseSchema,
  quietHoursResponseSchema,
} from '../schemas/notification.schema';
import type {
  NotificationItem,
  NotificationPage,
  NotificationPreferences,
  QuietHours,
} from '../types/notifications.types';

type NotificationDto = SchemaOutput<typeof notificationResponseSchema>;
type NotificationListDto = SchemaOutput<typeof notificationListResponseSchema>;
type PreferencesDto = SchemaOutput<typeof notificationPreferencesResponseSchema>;
type QuietHoursDto = SchemaOutput<typeof quietHoursResponseSchema>;

/** Identifiers travel as strings so a path builder never sees a raw number. */
function mapParams(params: NotificationDto['params']): Record<string, string> {
  return Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)]));
}

export function mapNotification(dto: NotificationDto): NotificationItem {
  return {
    id: dto.id,
    teamId: dto.teamId,
    category: dto.category,
    eventType: dto.eventType,
    titleKey: dto.titleKey,
    bodyKey: dto.bodyKey,
    params: mapParams(dto.params),
    readAt: dto.readAt,
    createdAt: dto.createdAt,
  };
}

export function mapNotificationPage(dto: NotificationListDto): NotificationPage {
  return {
    items: dto.items.map((item) => mapNotification(item)),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
  };
}

export function mapNotificationPreferences(dto: PreferencesDto): NotificationPreferences {
  return {
    items: dto.items.map((item) => ({
      category: item.category,
      channel: item.channel,
      enabled: item.enabled,
    })),
  };
}

/** The user id stays on the wire: the screen never needs to render it. */
export function mapQuietHours(dto: QuietHoursDto): QuietHours {
  return {
    timezone: dto.timezone,
    startsLocal: dto.startsLocal,
    endsLocal: dto.endsLocal,
    urgentCancellationOverride: dto.urgentCancellationOverride,
  };
}
