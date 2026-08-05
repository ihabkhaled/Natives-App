import { requestSchedule } from '../gateways/practice-schedules.gateway';
import type { PracticeSchedule, ScheduleItemParams } from '../types/practice-schedules.types';

/** One recurring pattern's full detail, for the edit screen. */
export function getPracticeSchedule(params: ScheduleItemParams): Promise<PracticeSchedule> {
  return requestSchedule(params);
}
