import { APP_PATHS } from '@/shared/config';

export function notificationsPagePath(): string {
  return APP_PATHS.notifications;
}

export function notificationPreferencesPagePath(): string {
  return APP_PATHS.notificationPreferences;
}

export function notificationLinkPattern(): string {
  return APP_PATHS.notificationLink;
}

/**
 * The arrival screen for a notification. Deep links always land here, never
 * on the target itself, so authorization is re-checked before anything from
 * the target is requested.
 */
export function notificationLinkPath(notificationId: string): string {
  return APP_PATHS.notificationLink.replace(':notificationId', encodeURIComponent(notificationId));
}
