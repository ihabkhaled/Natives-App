import { getPracticeSchedule } from '../services/get-practice-schedule.service';
import { listPracticeSchedules } from '../services/list-practice-schedules.service';
import type { PracticeSchedule, PracticeScheduleListPage } from '../types/practice-schedules.types';
import { practiceSchedulesQueryKeys } from './practice-schedules.keys';

/**
 * Query options for a team's schedule list. `enabled` guards the empty team
 * id: a screen rendered before the active team scope resolves must not fire a
 * read at `/teams//practice-schedules`.
 */
export function buildScheduleListQueryOptions(teamId: string): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<PracticeScheduleListPage>;
  readonly enabled: boolean;
} {
  return {
    queryKey: practiceSchedulesQueryKeys.list(teamId),
    queryFn: (): Promise<PracticeScheduleListPage> => listPracticeSchedules({ teamId }),
    enabled: teamId !== '',
  };
}

/** Query options for one schedule. Disabled in create mode, where there is no id yet. */
export function buildScheduleDetailQueryOptions(
  teamId: string,
  scheduleId: string,
): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<PracticeSchedule>;
  readonly enabled: boolean;
} {
  return {
    queryKey: practiceSchedulesQueryKeys.detail(teamId, scheduleId),
    queryFn: (): Promise<PracticeSchedule> => getPracticeSchedule({ teamId, scheduleId }),
    enabled: teamId !== '' && scheduleId !== '',
  };
}
