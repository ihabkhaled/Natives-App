import { useAppMutation, useQueryClient } from '@/packages/query';

import { practiceSchedulesQueryKeys } from '../queries/practice-schedules.keys';
import { createPracticeSchedule } from '../services/create-practice-schedule.service';
import type { PracticeSchedule, ScheduleDraft } from '../types/practice-schedules.types';
import type { ScheduleCreateCallbacks } from './practice-schedules-mutations.types';

export interface CreateScheduleMutationView {
  readonly run: (draft: ScheduleDraft) => void;
  readonly isRunning: boolean;
}

/**
 * Define a new recurring pattern.
 *
 * Composed from `useAppMutation` rather than `useInvalidatingMutation`: that
 * helper's `onSuccess` takes no argument, and here the created record IS the
 * report — the screen redirects to its detail path, which it can only do
 * once it knows the new id.
 */
export function useCreateScheduleMutation(
  teamId: string,
  callbacks: ScheduleCreateCallbacks,
): CreateScheduleMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<PracticeSchedule, ScheduleDraft>({
    mutationFn: (draft) => createPracticeSchedule({ teamId, draft }),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: practiceSchedulesQueryKeys.team(teamId) });
    },
  });
  return {
    run: (draft) => {
      mutation.mutate(draft);
    },
    isRunning: mutation.isPending,
  };
}
