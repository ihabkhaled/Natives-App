import { describe, expect, it } from 'vitest';

import { buildNotificationItem } from '../../../../tests/factories/notifications.factory';

import {
  countUnread,
  filterNotifications,
  groupNotifications,
  resolveDelivery,
} from './notification-group.helper';

const NOW = '2026-07-20T09:00:00.000Z';

describe('resolveDelivery', () => {
  it('reports an unread entry as delivered, not read', () => {
    expect(resolveDelivery(buildNotificationItem())).toEqual({
      state: 'delivered',
      deliveredAt: NOW,
      readAt: null,
    });
  });

  it('reports a read entry with the instant it was read', () => {
    expect(
      resolveDelivery(buildNotificationItem({ readAt: '2026-07-20T10:00:00.000Z' })).state,
    ).toBe('read');
  });
});

describe('filterNotifications', () => {
  const items = [
    buildNotificationItem({ id: 'a', readAt: null, category: 'practice' }),
    buildNotificationItem({ id: 'b', readAt: NOW, category: 'system' }),
  ];

  it('keeps everything when both filters are open', () => {
    expect(filterNotifications(items, { status: 'all', category: 'all' })).toHaveLength(2);
  });

  it('narrows to unread only', () => {
    expect(filterNotifications(items, { status: 'unread', category: 'all' })).toEqual([items[0]]);
  });

  it('narrows to read only', () => {
    expect(filterNotifications(items, { status: 'read', category: 'all' })).toEqual([items[1]]);
  });

  it('narrows by category', () => {
    expect(filterNotifications(items, { status: 'all', category: 'system' })).toEqual([items[1]]);
  });
});

describe('groupNotifications', () => {
  it('buckets arrivals into today, yesterday, and earlier', () => {
    const grouped = groupNotifications(
      [
        buildNotificationItem({ id: 'today', createdAt: NOW }),
        buildNotificationItem({ id: 'yesterday', createdAt: '2026-07-19T23:00:00.000Z' }),
        buildNotificationItem({ id: 'earlier', createdAt: '2026-07-01T09:00:00.000Z' }),
      ],
      NOW,
    );

    expect(grouped.map((bucket) => bucket.group)).toEqual(['today', 'yesterday', 'earlier']);
  });

  it('drops a bucket that has nothing in it', () => {
    const grouped = groupNotifications([buildNotificationItem({ createdAt: NOW })], NOW);

    expect(grouped).toHaveLength(1);
    expect(grouped[0]?.group).toBe('today');
  });

  it('treats an arrival the clock cannot parse as earlier rather than today', () => {
    const grouped = groupNotifications(
      [buildNotificationItem({ createdAt: 'not-an-instant' })],
      NOW,
    );

    expect(grouped[0]?.group).toBe('earlier');
  });

  it('treats a future arrival as today rather than inventing a bucket', () => {
    const grouped = groupNotifications(
      [buildNotificationItem({ createdAt: '2026-07-25T09:00:00.000Z' })],
      NOW,
    );

    expect(grouped[0]?.group).toBe('today');
  });
});

describe('countUnread', () => {
  it('counts only the entries with no read instant', () => {
    expect(
      countUnread([
        buildNotificationItem({ readAt: null }),
        buildNotificationItem({ readAt: NOW }),
      ]),
    ).toBe(1);
  });

  it('is zero for an empty window', () => {
    expect(countUnread([])).toBe(0);
  });
});
