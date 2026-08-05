import { getReminderStatus } from '../services/get-reminder-status.service';
import type { ReminderStatus } from '../types/practice-reminders.types';
import { practiceRemindersQueryKeys } from './practice-reminders.keys';

/**
 * Query options for one session's reminder state. `enabled` guards the empty
 * session id: a route that failed to match must not fire a read at
 * `/practice-sessions//reminders/status`.
 */
export function buildReminderStatusQueryOptions(
  teamId: string,
  sessionId: string,
): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<ReminderStatus>;
  readonly enabled: boolean;
} {
  return {
    queryKey: practiceRemindersQueryKeys.status(teamId, sessionId),
    queryFn: (): Promise<ReminderStatus> => getReminderStatus({ teamId, sessionId }),
    enabled: sessionId !== '',
  };
}
