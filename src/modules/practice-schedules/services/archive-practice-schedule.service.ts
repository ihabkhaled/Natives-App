import { requestScheduleArchive } from '../gateways/practice-schedules.gateway';
import type { ScheduleItemParams } from '../types/practice-schedules.types';

/** Retire a pattern. Sessions already generated from it are untouched. */
export function archivePracticeSchedule(params: ScheduleItemParams): Promise<void> {
  return requestScheduleArchive(params);
}
