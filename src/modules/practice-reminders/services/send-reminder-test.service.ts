import { requestReminderTest } from '../gateways/practice-reminders.gateway';
import type { ReminderRequestParams, ReminderTestResult } from '../types/practice-reminders.types';

/** Enqueue a single reminder addressed to the caller and nobody else. */
export function sendReminderTest(params: ReminderRequestParams): Promise<ReminderTestResult> {
  return requestReminderTest(params);
}
