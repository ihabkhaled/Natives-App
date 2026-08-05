import { useAppMutation } from '@/packages/query';

import { sendReminderTest } from '../services/send-reminder-test.service';
import type { ReminderTestResult } from '../types/practice-reminders.types';
import type {
  ReminderMutationScope,
  ReminderMutationView,
  ReminderTestCallbacks,
} from './practice-reminders-mutations.types';

/**
 * Send one reminder to the caller alone, so a coach can see what the roster
 * would receive without mailing the roster to find out.
 *
 * No cache invalidation: a self-test is not part of the session's dispatch
 * record and changes nothing the status read reports. Refreshing here would
 * only imply it did.
 *
 * A refusal is not an error. The server declines inside the caller's own quiet
 * hours, and the screen says so — that is the preference working.
 */
export function useTestReminderMutation(
  scope: ReminderMutationScope,
  callbacks: ReminderTestCallbacks,
): ReminderMutationView {
  const mutation = useAppMutation<ReminderTestResult, undefined>({
    mutationFn: () => sendReminderTest({ teamId: scope.teamId, sessionId: scope.sessionId }),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
  return {
    run: () => {
      mutation.mutate(undefined);
    },
    isRunning: mutation.isPending,
  };
}
