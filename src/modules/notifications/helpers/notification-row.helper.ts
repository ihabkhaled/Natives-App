import { I18N_KEYS } from '@/shared/i18n';

import {
  CATEGORY_LABEL_KEYS,
  CATEGORY_TONES,
  DELIVERY_LABEL_KEYS,
  DELIVERY_TONES,
  EVENT_TITLE_KEYS,
  GROUP_LABEL_KEYS,
} from '../constants/notifications-labels.constants';
import type { NotificationGroup } from '../constants/notifications.constants';
import type { NotificationItem } from '../types/notifications.types';
import type { NotificationRowView } from '../types/notifications-view.types';
import { resolveDelivery, type GroupedNotifications } from './notification-group.helper';
import { resolveNotificationTarget } from './notification-target.helper';

type Translate = (key: string, params?: Record<string, string | number>) => string;
type FormatInstant = (iso: string) => string;

/**
 * The heading a notification renders. The server sends a key, never prose, so
 * an unmapped event still resolves to designed copy rather than a wire token.
 */
function resolveTitle(t: Translate, item: NotificationItem): string {
  const key = EVENT_TITLE_KEYS[item.eventType];
  return key === undefined ? t(I18N_KEYS.notifications.eventSystemNotice) : t(key);
}

/** One inbox row. The body is generic copy: payload text never reaches here. */
export function buildNotificationRow(
  t: Translate,
  formatInstant: FormatInstant,
  item: NotificationItem,
): NotificationRowView {
  const delivery = resolveDelivery(item);
  return {
    id: item.id,
    title: resolveTitle(t, item),
    body: t(I18N_KEYS.notifications.bodyGeneric),
    categoryLabel: t(CATEGORY_LABEL_KEYS[item.category]),
    categoryTone: CATEGORY_TONES[item.category],
    receivedLabel: `${t(I18N_KEYS.notifications.receivedAtLabel)}: ${formatInstant(delivery.deliveredAt)}`,
    deliveryLabel: t(DELIVERY_LABEL_KEYS[delivery.state]),
    deliveryTone: DELIVERY_TONES[delivery.state],
    readLabel:
      delivery.readAt === null
        ? null
        : `${t(I18N_KEYS.notifications.readAtLabel)}: ${formatInstant(delivery.readAt)}`,
    isUnread: delivery.state === 'delivered',
    openLabel: t(I18N_KEYS.notifications.open),
    canOpen: resolveNotificationTarget(item) !== null,
    markReadLabel: t(I18N_KEYS.notifications.markRead),
  };
}

/** Translated day-bucket heading plus its rows. */
export function buildNotificationGroups(
  t: Translate,
  formatInstant: FormatInstant,
  buckets: readonly GroupedNotifications[],
): readonly { key: NotificationGroup; heading: string; rows: readonly NotificationRowView[] }[] {
  return buckets.map((bucket) => ({
    key: bucket.group,
    heading: t(GROUP_LABEL_KEYS[bucket.group]),
    rows: bucket.items.map((item) => buildNotificationRow(t, formatInstant, item)),
  }));
}
