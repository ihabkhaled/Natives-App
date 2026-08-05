/**
 * The one reason the server gives for declining a test send. Quiet hours are a
 * member preference, so a refusal here is the system working, not failing —
 * the UI says so rather than showing an error.
 */
export const REMINDER_SUPPRESSION_REASON = {
  QuietHours: 'quiet_hours',
} as const;

export const REMINDER_SUPPRESSION_REASONS = [REMINDER_SUPPRESSION_REASON.QuietHours] as const;

export type ReminderSuppressionReason = (typeof REMINDER_SUPPRESSION_REASONS)[number];
