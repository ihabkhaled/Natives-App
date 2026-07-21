import type { Permission } from '@/shared/security';

import type {
  DeliveryState,
  NotificationCategory,
  NotificationChannel,
} from '../constants/notifications.constants';

/**
 * One inbox entry. `params` carries identifiers only — never a name, a body,
 * or any other payload the recipient might not be allowed to read.
 */
export interface NotificationItem {
  readonly id: string;
  readonly teamId: string | null;
  readonly category: NotificationCategory;
  readonly eventType: string;
  readonly titleKey: string;
  readonly bodyKey: string;
  readonly params: Readonly<Record<string, string>>;
  readonly readAt: string | null;
  readonly createdAt: string;
}

export interface NotificationPage {
  readonly items: readonly NotificationItem[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

export interface NotificationPreference {
  readonly category: NotificationCategory;
  readonly channel: NotificationChannel;
  readonly enabled: boolean;
}

export interface NotificationPreferences {
  readonly items: readonly NotificationPreference[];
}

export interface QuietHours {
  readonly timezone: string;
  readonly startsLocal: string;
  readonly endsLocal: string;
  readonly urgentCancellationOverride: boolean;
}

/** The command shape a preference switch sends; one row at a time. */
export interface UpdatePreferenceCommand {
  readonly category: NotificationCategory;
  readonly channel: NotificationChannel;
  readonly enabled: boolean;
}

/**
 * Where a notification points and what the principal must still hold to be
 * allowed there. Resolution is pure; authorization is re-checked on arrival.
 */
export interface NotificationTarget {
  readonly path: string;
  readonly permissions: readonly Permission[];
}

/** In-app delivery, the only channel state the recipient may be told about. */
export interface NotificationDelivery {
  readonly state: DeliveryState;
  readonly deliveredAt: string;
  readonly readAt: string | null;
}
