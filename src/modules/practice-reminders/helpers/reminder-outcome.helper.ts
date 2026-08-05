import { REMINDER_SUPPRESSION_REASON } from '../constants/practice-reminders.constants';
import type { ReminderDispatchResult, ReminderTestResult } from '../types/practice-reminders.types';
import { countHeldBack } from './reminder-window.helper';

/** A finished action's message: which key to render, and with what numbers. */
export interface ReminderOutcome {
  readonly key: string;
  readonly params: Readonly<Record<string, number>>;
}

/**
 * What to tell the coach after a dispatch.
 *
 * Zero candidates is reported as "nothing was due" rather than "queued 0 of 0",
 * which reads like a failure. When some candidates were held back the count is
 * named, because the difference between 15 sent and 12 sent is the thing a
 * coach would otherwise have to work out from two numbers.
 */
export function describeDispatch(
  result: ReminderDispatchResult,
  keys: {
    readonly nothingDue: string;
    readonly sent: string;
    readonly heldBack: string;
  },
): readonly ReminderOutcome[] {
  if (result.candidates === 0) {
    return [{ key: keys.nothingDue, params: {} }];
  }
  const outcomes: ReminderOutcome[] = [
    { key: keys.sent, params: { enqueued: result.enqueued, candidates: result.candidates } },
  ];
  const held = countHeldBack(result.candidates, result.enqueued);
  if (held > 0) {
    outcomes.push({ key: keys.heldBack, params: { count: held } });
  }
  return outcomes;
}

/**
 * What to tell the coach after a self-test. A refusal inside their own quiet
 * hours is the preference working, so it is reported as an outcome rather than
 * an error.
 */
export function describeTest(
  result: ReminderTestResult,
  keys: { readonly queued: string; readonly quietHours: string; readonly failed: string },
): string {
  if (result.enqueued) {
    return keys.queued;
  }
  return result.reason === REMINDER_SUPPRESSION_REASON.QuietHours ? keys.quietHours : keys.failed;
}
