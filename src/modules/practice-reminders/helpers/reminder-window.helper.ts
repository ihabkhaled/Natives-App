import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

import type { ReminderStatus } from '../types/practice-reminders.types';

/**
 * The one sentence that explains whether sending is worth doing, resolved in
 * the order that actually decides it.
 *
 * The cutoff is checked before the override because the override only means
 * anything once the cutoff has passed — a late cancellation reopens a closed
 * window, it does not reopen an open one. A finished session is stated last
 * and plainly: nothing about the reminder window matters once it is over.
 */
export function resolveReminderWindowKey(status: ReminderStatus): I18nKey {
  if (!status.upcoming) {
    return I18N_KEYS.practiceReminders.sessionPast;
  }
  if (!status.cutoff) {
    return I18N_KEYS.practiceReminders.windowOpen;
  }
  return status.urgentCancellationOverride
    ? I18N_KEYS.practiceReminders.windowReopened
    : I18N_KEYS.practiceReminders.windowClosed;
}

/**
 * Whether sending can accomplish anything right now.
 *
 * A past session, a closed window with no override, or nothing due all mean
 * the button would be a no-op. Disabling it is honest; letting a coach press
 * it and reporting "queued 0" is not.
 */
export function canDispatchReminders(status: ReminderStatus): boolean {
  if (!status.upcoming || status.kinds.length === 0) {
    return false;
  }
  return !status.cutoff || status.urgentCancellationOverride;
}

/** How many candidates the dispatch deliberately did not queue. */
export function countHeldBack(candidates: number, enqueued: number): number {
  return Math.max(0, candidates - enqueued);
}
