import { requestReminderStatus } from '../gateways/practice-reminders.gateway';
import type { ReminderRequestParams, ReminderStatus } from '../types/practice-reminders.types';

/** Where this session's reminders stand, exactly as the server holds it. */
export function getReminderStatus(params: ReminderRequestParams): Promise<ReminderStatus> {
  return requestReminderStatus(params);
}
