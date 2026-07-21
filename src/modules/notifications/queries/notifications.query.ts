import { getNotificationPreferences } from '../services/get-notification-preferences.service';
import { getQuietHours } from '../services/get-quiet-hours.service';
import { listNotifications } from '../services/list-notifications.service';
import { notificationsQueryKeys } from './notifications.keys';

/**
 * The inbox is bounded and paged forward: the query key holds the window size
 * the screen has grown to, so "load more" refetches one deterministic list
 * rather than accumulating unbounded pages in the cache.
 */
export function buildNotificationsQueryOptions(limit: number) {
  return {
    queryKey: notificationsQueryKeys.inbox(limit),
    queryFn: () => listNotifications(limit, 0),
    enabled: limit > 0,
  };
}

export function buildNotificationPreferencesQueryOptions() {
  return {
    queryKey: notificationsQueryKeys.preferences(),
    queryFn: () => getNotificationPreferences(),
    enabled: true,
  };
}

export function buildQuietHoursQueryOptions() {
  return {
    queryKey: notificationsQueryKeys.quietHours(),
    queryFn: () => getQuietHours(),
    enabled: true,
  };
}
