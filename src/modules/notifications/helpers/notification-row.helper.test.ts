import { describe, expect, it } from 'vitest';

import { buildNotificationItem } from '../../../../tests/factories/notifications.factory';

import { buildNotificationGroups, buildNotificationRow } from './notification-row.helper';

const t = (key: string): string => key;
const formatInstant = (iso: string): string => `formatted:${iso}`;

describe('buildNotificationRow', () => {
  it('renders designed copy, never the wire event type', () => {
    const row = buildNotificationRow(t, formatInstant, buildNotificationItem());

    expect(row.title).toBe('notifications.eventPracticePublished');
    expect(row.body).toBe('notifications.bodyGeneric');
    expect(row.title).not.toContain('practice.session.published');
  });

  it('falls back to designed copy for an event type it does not know', () => {
    const row = buildNotificationRow(
      t,
      formatInstant,
      buildNotificationItem({ eventType: 'brand.new.event' }),
    );

    expect(row.title).toBe('notifications.eventSystemNotice');
  });

  it('marks an unread entry as delivered and offers to mark it read', () => {
    const row = buildNotificationRow(t, formatInstant, buildNotificationItem());

    expect(row.isUnread).toBe(true);
    expect(row.deliveryLabel).toBe('notifications.deliveryDelivered');
    expect(row.readLabel).toBeNull();
  });

  it('shows the read instant once the entry has been read', () => {
    const row = buildNotificationRow(
      t,
      formatInstant,
      buildNotificationItem({ readAt: '2026-07-20T10:00:00.000Z' }),
    );

    expect(row.isUnread).toBe(false);
    expect(row.deliveryLabel).toBe('notifications.deliveryRead');
    expect(row.readLabel).toBe('notifications.readAtLabel: formatted:2026-07-20T10:00:00.000Z');
  });

  it('offers to open only when the notification routes somewhere', () => {
    expect(buildNotificationRow(t, formatInstant, buildNotificationItem()).canOpen).toBe(true);
    expect(
      buildNotificationRow(t, formatInstant, buildNotificationItem({ params: {} })).canOpen,
    ).toBe(false);
  });

  it('presents the arrival instant through the supplied formatter', () => {
    expect(buildNotificationRow(t, formatInstant, buildNotificationItem()).receivedLabel).toBe(
      'notifications.receivedAtLabel: formatted:2026-07-20T09:00:00.000Z',
    );
  });

  it('carries the category label and tone', () => {
    const row = buildNotificationRow(
      t,
      formatInstant,
      buildNotificationItem({ category: 'system' }),
    );

    expect(row.categoryLabel).toBe('notifications.categorySystem');
    expect(row.categoryTone).toBe('warning');
  });
});

describe('buildNotificationGroups', () => {
  it('translates each bucket heading and builds its rows', () => {
    const groups = buildNotificationGroups(t, formatInstant, [
      { group: 'today', items: [buildNotificationItem({ id: 'a' })] },
      { group: 'earlier', items: [buildNotificationItem({ id: 'b' })] },
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
