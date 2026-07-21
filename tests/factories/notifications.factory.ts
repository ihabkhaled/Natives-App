import type { NotificationItem } from '@/modules/notifications';

/** Deterministic inbox entry shared by the notification helper tests. */
export function buildNotificationItem(overrides: Partial<NotificationItem> = {}): NotificationItem {
  return {
    id: 'ntf-1',
    teamId: 'team-1',
    category: 'practice',
    eventType: 'practice.session.published',
    titleKey: 'notifications.eventPracticePublished',
    bodyKey: 'notifications.bodyGeneric',
    params: { sessionId: 'session-1' },
    readAt: null,
    createdAt: '2026-07-20T09:00:00.000Z',
    ...overrides,
  };
}
