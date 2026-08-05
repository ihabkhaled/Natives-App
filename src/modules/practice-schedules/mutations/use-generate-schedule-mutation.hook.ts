import { practiceQueryKeys } from '@/modules/practice';
import { useAppMutation, useQueryClient } from '@/packages/query';

import { generatePracticeScheduleSessions } from '../services/generate-practice-schedule-sessions.service';
import type { GenerationResult } from '../types/practice-schedules.types';
import type {
  ScheduleGenerateCallbacks,
  ScheduleMutationScope,
  ScheduleMutationView,
} from './practice-schedules-mutations.types';

/**
 * Turn the pattern into real sessions.
 *
 * Invalidates the practice module's session cache — through its public query
 * keys, never a duplicated key of our own — because a successful run creates
 * rows the calendar owns. Nothing about the schedule record itself changes,
 * so this module's own cache is left alone.
 *
 * Nothing optimistic: the created/skipped counts the screen reports come only
 * from what the server actually did.
 */
export function useGenerateScheduleMutation(
  scope: ScheduleMutationScope,
  callbacks: ScheduleGenerateCallbacks,
): ScheduleMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<GenerationResult, undefined>({
    mutationFn: () => generatePracticeScheduleSessions(scope),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: practiceQueryKeys.team(scope.teamId) });
    },
  });
  return {
    run: () => {
      mutation.mutate(undefined);
    },
    isRunning: mutation.isPending,
  };
}
