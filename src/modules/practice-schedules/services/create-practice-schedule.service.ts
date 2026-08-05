import { requestScheduleCreate } from '../gateways/practice-schedules.gateway';
import { toCreateScheduleBody } from '../mappers/practice-schedules.mapper';
import type { PracticeSchedule, ScheduleCreateCommand } from '../types/practice-schedules.types';

/** Define a new recurring pattern for a team to practise on. */
export function createPracticeSchedule(command: ScheduleCreateCommand): Promise<PracticeSchedule> {
  return requestScheduleCreate({ teamId: command.teamId }, toCreateScheduleBody(command.draft));
}
