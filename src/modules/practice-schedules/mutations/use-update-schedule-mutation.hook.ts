import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { practiceSchedulesQueryKeys } from '../queries/practice-schedules.keys';
import { updatePracticeSchedule } from '../services/update-practice-schedule.service';
import type { PracticeSchedule, ScheduleUpdateCommand } from '../types/practice-schedules.types';
import type {
  ScheduleMutationScope,
  ScheduleUpdateCallbacks,
} from './practice-schedules-mutations.types';

/**
 * Save edits to an existing pattern. Invalidates the team's whole schedule
 * branch, not just this record: the list row's summary (frequency, weekdays,
 * time) is derived from the same fields the form just changed.
 */
export function useUpdateScheduleMutation(
  scope: ScheduleMutationScope,
  callbacks: ScheduleUpdateCallbacks,
): InvalidatingMutationView<ScheduleUpdateCommand> {
  return useInvalidatingMutation<PracticeSchedule, ScheduleUpdateCommand>({
    mutationFn: updatePracticeSchedule,
    invalidateKey: practiceSchedulesQueryKeys.team(scope.teamId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
