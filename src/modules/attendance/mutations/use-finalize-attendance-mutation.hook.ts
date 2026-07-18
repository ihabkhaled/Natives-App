import { useAppMutation, useQueryClient } from '@/packages/query';
import type { AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { attendanceQueryKeys } from '../queries/attendance.keys';
import { finalizeAttendance } from '../services/finalize-attendance.service';
import type { AttendanceFinalization } from '../types/attendance.types';

interface FinalizeCallbacks {
  readonly onSuccess: () => void;
  readonly onError: (error: AppError) => void;
}

export interface FinalizeAttendanceMutationView {
  readonly finalize: (expectedVersion: number) => void;
  readonly isSubmitting: boolean;
}

export function useFinalizeAttendanceMutation(
  teamId: string,
  sessionId: string,
  callbacks: FinalizeCallbacks,
): FinalizeAttendanceMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<AttendanceFinalization, number>({
    mutationFn: (expectedVersion) => finalizeAttendance(teamId, sessionId, expectedVersion),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.sheet(teamId, sessionId),
      });
      callbacks.onSuccess();
    },
    onError: (error) => {
      callbacks.onError(toAppError(error));
    },
  });
  return {
    finalize: (expectedVersion) => {
      mutation.mutate(expectedVersion);
    },
    isSubmitting: mutation.isPending,
  };
}
