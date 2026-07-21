import { describe, expect, it } from 'vitest';

import type { NotificationItem } from '../types/notifications.types';
import { buildNotificationGroups, buildNotificationRow } from './notification-row.helper';

const t = (key: string): string => key;
const formatInstant = (iso: string): string => `formatted:${iso}`;

function item(overrides: Partial<NotificationItem> = {}): NotificationItem {
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

describe('buildNotificationRow', () => {
  it('renders designed copy, never the wire event type', () => {
    const row = buildNotificationRow(t, formatInstant, item());

    expect(row.title).toBe('notifications.eventPracticePublished');
    expect(row.body).toBe('notifications.bodyGeneric');
    expect(row.title).not.toContain('practice.session.published');
  });

  it('falls back to designed copy for an event type it does not know', () => {
    const row = buildNotificationRow(t, formatInstant, item({ eventType: 'brand.new.event' }));

    expect(row.title).toBe('notifications.eventSystemNotice');
  });

  it('marks an unread entry as delivered and offers to mark it read', () => {
    const row = buildNotificationRow(t, formatInstant, item());

    expect(row.isUnread).toBe(true);
    expect(row.deliveryLabel).toBe('notifications.deliveryDelivered');
    expect(row.readLabel).toBeNull();
  });

  it('shows the read instant once the entry has been read', () => {
    const row = buildNotificationRow(
      t,
      formatInstant,
      item({ readAt: '2026-07-20T10:00:00.000Z' }),
    );

    expect(row.isUnread).toBe(false);
    expect(row.deliveryLabel).toBe('notifications.deliveryRead');
    expect(row.readLabel).toBe('notifications.readAtLabel: formatted:2026-07-20T10:00:00.000Z');
  });

  it('offers to open only when the notification routes somewhere', () => {
    expect(buildNotificationRow(t, formatInstant, item()).canOpen).toBe(true);
    expect(buildNotificationRow(t, formatInstant, item({ params: {} })).canOpen).toBe(false);
  });

  it('presents the arrival instant through the supplied formatter', () => {
    expect(buildNotificationRow(t, formatInstant, item()).receivedLabel).toBe(
      'notifications.receivedAtLabel: formatted:2026-07-20T09:00:00.000Z',
    );
  });

  it('carries the category label and tone', () => {
    const row = buildNotificationRow(t, formatInstant, item({ category: 'system' }));

    expect(row.categoryLabel).toBe('notifications.categorySystem');
    expect(row.categoryTone).toBe('warning');
  });
});

describe('buildNotificationGroups', () => {
  it('translates each bucket heading and builds its rows', () => {
    const groups = buildNotificationGroups(t, formatInstant, [
      { group: 'today', items: [item({ id: 'a' })] },
      { group: 'earlier', items: [item({ id: 'b' })] },
    ]);

    expect(groups.map((group) => group.heading)).toEqual([
      'notifications.groupToday',
      'notifications.groupEarlier',
    ]);
    expect(groups[0]?.rows[0]?.id).toBe('a');
  });

  it('produces nothing for no buckets', () => {
    expect(buildNotificationGroups(t, formatInstant, [])).toEqual([]);
  });
});
