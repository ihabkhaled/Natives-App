import { isHttpError } from '@/packages/http';
import { APP_ERROR_CODE } from '@/shared/errors';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import {
  ATTENDANCE_QUEUE_MAX_RETRIES,
  ATTENDANCE_QUEUE_STATE,
} from '../constants/attendance.constants';
import { requestAttendanceRecord } from '../gateways/attendance.gateway';
import { useAttendanceQueueStore } from '../store/attendance-queue.store';
import type {
  AttendanceQueuedOperation,
  AttendanceQueueReplayResult,
} from '../types/attendance.types';

async function replayOne(
  operation: AttendanceQueuedOperation,
): Promise<'success' | 'conflict' | 'failed'> {
  const store = useAttendanceQueueStore.getState();
  store.setOperationState(operation.operationId, ATTENDANCE_QUEUE_STATE.retrying, false);
  try {
    await requestAttendanceRecord(operation.teamId, operation.sessionId, operation);
    useAttendanceQueueStore.getState().remove(operation.operationId);
    return 'success';
  } catch (error) {
    const appError = isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
    if (appError.code === APP_ERROR_CODE.Conflict) {
      useAttendanceQueueStore
        .getState()
        .setOperationState(operation.operationId, ATTENDANCE_QUEUE_STATE.conflict, false);
      return 'conflict';
    }
    const nextRetry = operation.retryCount + 1;
    useAttendanceQueueStore
      .getState()
      .setOperationState(
        operation.operationId,
        nextRetry >= ATTENDANCE_QUEUE_MAX_RETRIES
          ? ATTENDANCE_QUEUE_STATE.failed
          : ATTENDANCE_QUEUE_STATE.pending,
        true,
      );
    return 'failed';
  }
}

export async function replayAttendanceQueue(
  operations: readonly AttendanceQueuedOperation[],
): Promise<AttendanceQueueReplayResult> {
  const succeededOperationIds: string[] = [];
  const conflictOperationIds: string[] = [];
  const failedOperationIds: string[] = [];
  for (const operation of operations) {
    if (operation.state === ATTENDANCE_QUEUE_STATE.conflict) {
      conflictOperationIds.push(operation.operationId);
      continue;
    }
    const outcome = await replayOne(operation);
    if (outcome === 'success') {
      succeededOperationIds.push(operation.operationId);
    } else if (outcome === 'conflict') {
      conflictOperationIds.push(operation.operationId);
    } else {
      failedOperationIds.push(operation.operationId);
    }
  }
  return { succeededOperationIds, conflictOperationIds, failedOperationIds };
}
