import { describe, expect, it } from 'vitest';

import { buildInboxLabels } from './inbox-labels.helper';

const t = (key: string): string => key;

describe('buildInboxLabels', () => {
  it('states "all caught up" when nothing is unread', () => {
    expect(
      buildInboxLabels(t, { unread: 0, shown: 3, total: 3, canReadDeliveryFailures: false })
        .unreadLabel,
    ).toBe('notifications.allReadLabel');
  });

  it('states the unread count when there is one', () => {
    expect(
      buildInboxLabels(t, { unread: 2, shown: 3, total: 9, canReadDeliveryFailures: false })
        .unreadLabel,
    ).toBe('notifications.unreadCount');
  });

  it('offers the operations-centre link only to an authorized administrator', () => {
    expect(
      buildInboxLabels(t, { unread: 0, shown: 0, total: 0, canReadDeliveryFailures: true })
        .deliveryLinkLabel,
    ).toBe('notifications.deliveryAdminLink');
    expect(
      buildInboxLabels(t, { unread: 0, shown: 0, total: 0, canReadDeliveryFailures: false })
        .deliveryLinkLabel,
    ).toBeNull();
  });

  it('always states the bounded-window limit', () => {
    expect(
      buildInboxLabels(t, { unread: 0, shown: 0, total: 0, canReadDeliveryFailures: false })
        .boundedNotice,
    ).toBe('notifications.boundedNotice');
  });

  it('carries the filter option lists', () => {
    const labels = buildInboxLabels(t, {
      unread: 0,
      shown: 0,
      total: 0,
      canReadDeliveryFailures: false,
    });

    expect(labels.statusOptions).toHaveLength(3);
    expect(labels.categoryOptions).toHaveLength(5);
  });
});
