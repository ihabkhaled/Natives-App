import { dashboardQueryKeys } from '@/modules/dashboard';
import { useAppMutation, useQueryClient } from '@/packages/query';
import type { AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { attendanceQueryKeys } from '../queries/attendance.keys';
import { selfCheckIn } from '../services/self-check-in.service';
import type { AttendanceSelfRecord } from '../types/attendance.types';

interface CheckInCallbacks {
  readonly onSuccess: () => void;
  readonly onError: (error: AppError) => void;
}

export interface CheckInMutationView {
  readonly checkIn: (note: string | null) => void;
  readonly isSubmitting: boolean;
}

/**
 * Self check-in. Success invalidates the caller's own record, their
 * participation and history families, and the Home summary — the
 * member-attendance widget reads the same fact this write just changed.
 */
export function useCheckInMutation(
  teamId: string,
  sessionId: string,
  callbacks: CheckInCallbacks,
): CheckInMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<AttendanceSelfRecord, string | null>({
    mutationFn: (note) => selfCheckIn(teamId, sessionId, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.self(teamId, sessionId),
      });
      void queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.participationFamily(teamId),
      });
      void queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.selfHistoryFamily(teamId),
      });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.summary() });
      callbacks.onSuccess();
    },
    onError: (error) => {
      callbacks.onError(toAppError(error));
    },
  });
  return {
    checkIn: (note) => {
      mutation.mutate(note);
    },
    isSubmitting: mutation.isPending,
  };
}
