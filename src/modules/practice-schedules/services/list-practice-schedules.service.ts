import { requestScheduleList } from '../gateways/practice-schedules.gateway';
import type { PracticeScheduleListPage, ScheduleTeamParams } from '../types/practice-schedules.types';

/** Every recurring pattern a team has defined. */
export function listPracticeSchedules(
  params: ScheduleTeamParams,
): Promise<PracticeScheduleListPage> {
  return requestScheduleList(params);
}
