import { requestScheduleUpdate } from '../gateways/practice-schedules.gateway';
import { toUpdateScheduleBody } from '../mappers/practice-schedules.mapper';
import type { PracticeSchedule, ScheduleUpdateCommand } from '../types/practice-schedules.types';

/**
 * Save edits to an existing pattern. `expectedVersion` travels on every call
 * so a coach who edited a stale copy gets the server's conflict, not a write
 * that silently overwrites someone else's change.
 */
export function updatePracticeSchedule(command: ScheduleUpdateCommand): Promise<PracticeSchedule> {
  return requestScheduleUpdate(command.params, toUpdateScheduleBody(command));
}
