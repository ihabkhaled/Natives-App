import type { AttendanceQueueStoreState } from './attendance-queue.store';
import type { AttendanceQueuedOperation } from '../types/attendance.types';

export function selectSessionQueue(
  state: AttendanceQueueStoreState,
  teamId: string,
  sessionId: string,
): readonly AttendanceQueuedOperation[] {
  return state.operations.filter(
    (operation) => operation.teamId === teamId && operation.sessionId === sessionId,
  );
}
