import { nowIso } from '@/packages/date';
import { createCorrelationId } from '@/packages/http';

import { ATTENDANCE_QUEUE_STATE } from '../constants/attendance.constants';
import { useAttendanceQueueStore } from '../store/attendance-queue.store';
import type { AttendanceMark, AttendanceQueuedOperation } from '../types/attendance.types';

export function queueAttendanceMarks(
  teamId: string,
  sessionId: string,
  marks: readonly AttendanceMark[],
): readonly AttendanceQueuedOperation[] {
  const operations = marks.map((mark) => ({
    ...mark,
    operationId: createCorrelationId(),
    teamId,
    sessionId,
    state: ATTENDANCE_QUEUE_STATE.pending,
    retryCount: 0,
    createdAtIso: nowIso(),
  }));
  useAttendanceQueueStore.getState().enqueue(operations);
  return operations;
}
