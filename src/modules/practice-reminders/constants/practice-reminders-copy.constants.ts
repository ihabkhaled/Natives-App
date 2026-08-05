import { I18N_KEYS } from '@/shared/i18n';

const KEYS = I18N_KEYS.practiceReminders;

/** The three outcomes a dispatch can report, in the order they are shown. */
export const REMINDER_DISPATCH_COPY_KEYS = {
  nothingDue: KEYS.dispatchNothingDue,
  sent: KEYS.dispatchResult,
  heldBack: KEYS.dispatchHeldBack,
} as const;

/** A self-test either queued, was held by quiet hours, or genuinely failed. */
export const REMINDER_TEST_COPY_KEYS = {
  queued: KEYS.testQueued,
  quietHours: KEYS.testQuietHours,
  failed: KEYS.actionFailed,
} as const;
