import { useAppMutation, useQueryClient } from '@/packages/query';

import { practiceRemindersQueryKeys } from '../queries/practice-reminders.keys';
import { dispatchReminders } from '../services/dispatch-reminders.service';
import type { ReminderDispatchResult } from '../types/practice-reminders.types';
import type {
  ReminderDispatchCallbacks,
  ReminderMutationScope,
  ReminderMutationView,
} from './practice-reminders-mutations.types';

/**
 * Send the reminders that are due, then re-read the status the send changed.
 *
 * Composed from `useAppMutation` rather than `useInvalidatingMutation` on
 * purpose: that helper's `onSuccess` takes no argument, and here the result IS
 * the report — a coach needs to be told that 12 of 15 candidates were queued
 * and three were held back, not merely that the request succeeded.
 *
 * Nothing optimistic. "Sent" is never shown for a message the queue refused.
 */
export function useDispatchRemindersMutation(
  scope: ReminderMutationScope,
  callbacks: ReminderDispatchCallbacks,
): ReminderMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<ReminderDispatchResult, undefined>({
    mutationFn: () => dispatchReminders({ teamId: scope.teamId, sessionId: scope.sessionId }),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: practiceRemindersQueryKeys.status(scope.teamId, scope.sessionId),
      });
    },
  });
  return {
    run: () => {
      mutation.mutate(undefined);
    },
    isRunning: mutation.isPending,
  };
}
