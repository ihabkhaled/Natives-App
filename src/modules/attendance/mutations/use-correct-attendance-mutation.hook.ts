import { useAppMutation, useQueryClient } from '@/packages/query';
import type { AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { attendanceQueryKeys } from '../queries/attendance.keys';
import { correctAttendance } from '../services/correct-attendance.service';
import type { AttendanceCorrection, AttendanceRecord } from '../types/attendance.types';

interface CorrectionCallbacks {
  readonly onSuccess: () => void;
  readonly onError: (error: AppError) => void;
}

export interface CorrectAttendanceMutationView {
  readonly correct: (correction: AttendanceCorrection) => void;
  readonly isSubmitting: boolean;
}

export function useCorrectAttendanceMutation(
  teamId: string,
  sessionId: string,
  callbacks: CorrectionCallbacks,
): CorrectAttendanceMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<AttendanceRecord, AttendanceCorrection>({
    mutationFn: (correction) => correctAttendance(teamId, sessionId, correction),
    onSuccess: (_record, correction) => {
      void queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.history(teamId, sessionId, correction.membershipId),
      });
      callbacks.onSuccess();
    },
    onError: (error) => {
      callbacks.onError(toAppError(error));
    },
  });
  return {
    correct: (correction) => {
      mutation.mutate(correction);
    },
    isSubmitting: mutation.isPending,
  };
}
