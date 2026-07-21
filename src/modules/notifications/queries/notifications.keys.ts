/** Stable query-key builders for the notification cache. */
export const notificationsQueryKeys = {
  all: ['notifications'] as const,
  inbox: (limit: number) => [...notificationsQueryKeys.all, 'inbox', limit] as const,
  preferences: () => [...notificationsQueryKeys.all, 'preferences'] as const,
  quietHours: () => [...notificationsQueryKeys.all, 'quiet-hours'] as const,
};
