/**
 * Notification domain vocabulary. Categories and channels mirror the platform
 * module (prompt 105) contract; the mandatory set is a product rule the UI
 * enforces honestly rather than pretending a locked switch is editable.
 */
export const NOTIFICATION_CATEGORIES = [
  'member_lifecycle',
  'practice',
  'attendance',
  'system',
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const NOTIFICATION_CHANNELS = ['in_app', 'email', 'push'] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

/**
 * Categories that carry security and administrative notices. They cannot be
 * muted on any channel: the backend ignores an opt-out, so the UI renders the
 * switch as locked and says why instead of accepting a change it would lose.
 */
export const MANDATORY_CATEGORIES: readonly NotificationCategory[] = ['system'];

/** In-app is the system of record for an inbox; it is never optional. */
export const MANDATORY_CHANNELS: readonly NotificationChannel[] = ['in_app'];

/** Read/unread filter values the inbox offers. */
export const INBOX_STATUS_FILTERS = ['all', 'unread', 'read'] as const;

export type InboxStatusFilter = (typeof INBOX_STATUS_FILTERS)[number];

export const ALL_CATEGORIES_FILTER = 'all';

/** Every list is bounded: one page at a time, and a hard ceiling overall. */
export const NOTIFICATION_LIMITS = {
  pageSize: 20,
  maxItems: 100,
} as const;

/** Day buckets the inbox groups arrivals into. */
export const NOTIFICATION_GROUPS = ['today', 'yesterday', 'earlier'] as const;

export type NotificationGroup = (typeof NOTIFICATION_GROUPS)[number];

/** Delivery state the client can honestly report for the in-app channel. */
export type DeliveryState = 'delivered' | 'read';
