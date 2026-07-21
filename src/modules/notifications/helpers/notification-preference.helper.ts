import {
  MANDATORY_CATEGORIES,
  MANDATORY_CHANNELS,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
  type NotificationCategory,
  type NotificationChannel,
} from '../constants/notifications.constants';
import type { NotificationPreference } from '../types/notifications.types';

/**
 * Whether a switch is locked. Security and administrative categories cannot
 * be muted on any channel, and the in-app channel is never optional — the UI
 * says so and disables the control instead of accepting a change the backend
 * would discard.
 */
function isMandatory(category: NotificationCategory, channel: NotificationChannel): boolean {
  return MANDATORY_CATEGORIES.includes(category) || MANDATORY_CHANNELS.includes(channel);
}

/** The stored value, defaulting to on for anything the server has not sent. */
function isEnabled(
  preferences: readonly NotificationPreference[],
  category: NotificationCategory,
  channel: NotificationChannel,
): boolean {
  if (isMandatory(category, channel)) {
    return true;
  }
  const match = preferences.find(
    (preference) => preference.category === category && preference.channel === channel,
  );
  return match?.enabled ?? false;
}

interface PreferenceCell {
  readonly channel: NotificationChannel;
  readonly enabled: boolean;
  readonly locked: boolean;
}

export interface PreferenceRow {
  readonly category: NotificationCategory;
  readonly cells: readonly PreferenceCell[];
  readonly hasLockedCell: boolean;
}

/**
 * The full category × channel matrix, rebuilt from the catalog rather than
 * from whatever rows the server happened to persist, so a missing row shows
 * as an explicit "off" instead of disappearing.
 */
export function buildPreferenceMatrix(
  preferences: readonly NotificationPreference[],
): readonly PreferenceRow[] {
  return NOTIFICATION_CATEGORIES.map((category) => {
    const cells = NOTIFICATION_CHANNELS.map((channel) => ({
      channel,
      enabled: isEnabled(preferences, category, channel),
      locked: isMandatory(category, channel),
    }));
    return {
      category,
      cells,
      hasLockedCell: MANDATORY_CATEGORIES.includes(category),
    };
  });
}

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/u;

/** 24-hour local wall-clock time, the shape the quiet-hours contract uses. */
export function isValidLocalTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}
