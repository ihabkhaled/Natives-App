import { getNotificationPreferences } from '../services/get-notification-preferences.service';
import { getQuietHours } from '../services/get-quiet-hours.service';
import { listNotifications } from '../services/list-notifications.service';
import { notificationsQueryKeys } from './notifications.keys';

/**
 * The inbox is bounded and paged forward: the query key holds the window size
 * the screen has grown to, so "load more" refetches one deterministic list
 * rather than accumulating unbounded pages in the cache.
 *
 * `isAuthenticated` gates the request entirely: an authorized read must never
 * fire before the session's tokens are in place. Pre-auth it produced a
 * deterministic 401 that the old blanket retry happened to paper over —
 * with deterministic failures no longer retried, the request simply waits
 * for the session instead (recovery audit P0-5/P2-4).
 */
export function buildNotificationsQueryOptions(limit: number, isAuthenticated: boolean) {
  return {
    queryKey: notificationsQueryKeys.inbox(limit),
    queryFn: () => listNotifications(limit, 0),
    enabled: limit > 0 && isAuthenticated,
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
