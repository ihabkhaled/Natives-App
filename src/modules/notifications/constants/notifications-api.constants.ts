/**
 * Notification paths, relative to the versioned API base URL. All four are
 * published by the deployed platform module; the inbox is caller-scoped, so
 * no team segment appears here.
 */
export function notificationsPath(): string {
  return '/notifications';
}

export function notificationReadPath(notificationId: string): string {
  return `/notifications/${encodeURIComponent(notificationId)}/read`;
}

export function notificationPreferencesPath(): string {
  return '/notifications/preferences';
}

export function notificationQuietHoursPath(): string {
  return '/notifications/quiet-hours';
}
