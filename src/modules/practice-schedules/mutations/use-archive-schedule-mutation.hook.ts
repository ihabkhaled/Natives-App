import { useAppMutation, useQueryClient } from '@/packages/query';

import { practiceSchedulesQueryKeys } from '../queries/practice-schedules.keys';
import { archivePracticeSchedule } from '../services/archive-practice-schedule.service';
import type {
  ScheduleArchiveCallbacks,
  ScheduleMutationScope,
  ScheduleMutationView,
} from './practice-schedules-mutations.types';

/**
 * Archive one pattern. Composed from `useAppMutation` rather than
 * `useInvalidatingMutation`: the archive endpoint's body is discarded (see the
 * gateway), so there is no result to hand `onSuccess` beyond "it happened".
 */
export function useArchiveScheduleMutation(
  scope: ScheduleMutationScope,
  callbacks: ScheduleArchiveCallbacks,
): ScheduleMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<undefined, undefined>({
    mutationFn: async () => {
      await archivePracticeSchedule(scope);
      return undefined;
    },
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: practiceSchedulesQueryKeys.team(scope.teamId),
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
