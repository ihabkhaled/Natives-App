import { requestReminderDispatch } from '../gateways/practice-reminders.gateway';
import type {
  ReminderDispatchResult,
  ReminderRequestParams,
} from '../types/practice-reminders.types';

/** Enqueue the reminders that are due for this session. */
export function dispatchReminders(params: ReminderRequestParams): Promise<ReminderDispatchResult> {
  return requestReminderDispatch(params);
}
