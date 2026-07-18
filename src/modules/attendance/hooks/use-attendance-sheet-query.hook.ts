import { useAppQuery } from '@/packages/query';
import type { AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { buildAttendanceSheetQueryOptions } from '../queries/attendance-sheet.query';
import type { AttendanceSheet } from '../types/attendance.types';

export interface AttendanceSheetQueryView {
  readonly sheet: AttendanceSheet | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refetch: () => void;
}

export function useAttendanceSheetQuery(
  teamId: string,
  sessionId: string,
): AttendanceSheetQueryView {
  const query = useAppQuery<AttendanceSheet>(buildAttendanceSheetQueryOptions(teamId, sessionId));
  return {
    sheet: query.data,
    isLoading: query.isPending,
    error: query.error === null ? null : toAppError(query.error),
    refetch: () => {
      void query.refetch();
    },
  };
}
