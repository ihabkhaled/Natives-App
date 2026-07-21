import {
  ALL_CATEGORIES_FILTER,
  NOTIFICATION_GROUPS,
  type InboxStatusFilter,
  type NotificationGroup,
} from '../constants/notifications.constants';
import type { NotificationDelivery, NotificationItem } from '../types/notifications.types';

const DAY_MS = 86_400_000;

/** Calendar-day distance between two instants, in whole UTC days. */
function daysBetween(nowIso: string, createdAtIso: string): number {
  const now = Date.parse(nowIso);
  const created = Date.parse(createdAtIso);
  if (Number.isNaN(now) || Number.isNaN(created)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.floor(now / DAY_MS) - Math.floor(created / DAY_MS);
}

/** Which day bucket an arrival belongs to, relative to a supplied "now". */
function resolveNotificationGroup(nowIso: string, createdAtIso: string): NotificationGroup {
  const distance = daysBetween(nowIso, createdAtIso);
  if (distance <= 0) {
    return 'today';
  }
  return distance === 1 ? 'yesterday' : 'earlier';
}

/** The only delivery fact the recipient is entitled to: their own in-app copy. */
export function resolveDelivery(item: NotificationItem): NotificationDelivery {
  return {
    state: item.readAt === null ? 'delivered' : 'read',
    deliveredAt: item.createdAt,
    readAt: item.readAt,
  };
}

export interface InboxFilterInput {
  readonly status: InboxStatusFilter;
  readonly category: string;
}

function matchesStatus(item: NotificationItem, status: InboxStatusFilter): boolean {
  if (status === 'unread') {
    return item.readAt === null;
  }
  return status === 'read' ? item.readAt !== null : true;
}

/** Client-side narrowing of an already-bounded page. */
export function filterNotifications(
  items: readonly NotificationItem[],
  filters: InboxFilterInput,
): readonly NotificationItem[] {
  return items.filter(
    (item) =>
      matchesStatus(item, filters.status) &&
      (filters.category === ALL_CATEGORIES_FILTER || item.category === filters.category),
  );
}

export interface GroupedNotifications {
  readonly group: NotificationGroup;
  readonly items: readonly NotificationItem[];
}

/**
 * Bucket a filtered page into today / yesterday / earlier, dropping empty
 * buckets so the screen never renders a heading with nothing under it.
 */
export function groupNotifications(
  items: readonly NotificationItem[],
  nowIso: string,
): readonly GroupedNotifications[] {
  return NOTIFICATION_GROUPS.map((group) => ({
    group,
    items: items.filter((item) => resolveNotificationGroup(nowIso, item.createdAt) === group),
  })).filter((bucket) => bucket.items.length > 0);
}

/** Unread count over the loaded window, used by the app bar badge. */
export function countUnread(items: readonly NotificationItem[]): number {
  return items.filter((item) => item.readAt === null).length;
}
