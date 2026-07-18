import { useAppMutation, useQueryClient } from '@/packages/query';
import { APP_ERROR_CODE } from '@/shared/errors';
import type { AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { attendanceQueryKeys } from '../queries/attendance.keys';
import { queueAttendanceMarks } from '../services/queue-attendance-marks.service';
import { submitBulkAttendance } from '../services/submit-bulk-attendance.service';
import type { AttendanceBulkResult, AttendanceMark } from '../types/attendance.types';

interface BulkAttendanceCallbacks {
  readonly onSaved: (recorded: number) => void;
  readonly onQueued: (queued: number) => void;
  readonly onError: (error: AppError) => void;
}

interface BulkMutationResult {
  readonly mode: 'saved' | 'queued';
  readonly recorded: number;
}

export interface BulkAttendanceMutationView {
  readonly submit: (marks: readonly AttendanceMark[]) => void;
  readonly isSubmitting: boolean;
  readonly error: AppError | null;
}

async function submitOrQueue(
  teamId: string,
  sessionId: string,
  isOnline: boolean,
  marks: readonly AttendanceMark[],
): Promise<BulkMutationResult> {
  if (!isOnline) {
    queueAttendanceMarks(teamId, sessionId, marks);
    return { mode: 'queued', recorded: marks.length };
  }
  try {
    const result: AttendanceBulkResult = await submitBulkAttendance(teamId, sessionId, marks);
    return { mode: 'saved', recorded: result.recorded };
  } catch (error) {
    const appError = toAppError(error);
    if (
      appError.code === APP_ERROR_CODE.NetworkOffline ||
      appError.code === APP_ERROR_CODE.Timeout
    ) {
      queueAttendanceMarks(teamId, sessionId, marks);
      return { mode: 'queued', recorded: marks.length };
    }
    throw appError;
  }
}

export function useBulkAttendanceMutation(
  teamId: string,
  sessionId: string,
  isOnline: boolean,
  callbacks: BulkAttendanceCallbacks,
): BulkAttendanceMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<BulkMutationResult, readonly AttendanceMark[]>({
    mutationFn: (marks) => submitOrQueue(teamId, sessionId, isOnline, marks),
    onSuccess: (result) => {
      if (result.mode === 'queued') {
        callbacks.onQueued(result.recorded);
      } else {
        callbacks.onSaved(result.recorded);
        void queryClient.invalidateQueries({
          queryKey: attendanceQueryKeys.sheet(teamId, sessionId),
        });
      }
    },
    onError: (error) => {
      callbacks.onError(toAppError(error));
    },
  });
  return {
    submit: (marks) => {
      mutation.mutate(marks);
    },
    isSubmitting: mutation.isPending,
    error: mutation.error === null ? null : toAppError(mutation.error),
  };
}
