import { useAppQuery } from '@/packages/query';
import type { AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { buildAttendanceHistoryQueryOptions } from '../queries/attendance-history.query';
import type { AttendanceRevision } from '../types/attendance.types';

export interface AttendanceHistoryQueryView {
  readonly revisions: readonly AttendanceRevision[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
}

export function useAttendanceHistoryQuery(
  teamId: string,
  sessionId: string,
  membershipId: string,
): AttendanceHistoryQueryView {
  const query = useAppQuery<readonly AttendanceRevision[]>(
    buildAttendanceHistoryQueryOptions(teamId, sessionId, membershipId),
  );
  return {
    revisions: query.data ?? [],
    isLoading: query.isPending && membershipId !== '',
    error: query.error === null ? null : toAppError(query.error),
  };
}
