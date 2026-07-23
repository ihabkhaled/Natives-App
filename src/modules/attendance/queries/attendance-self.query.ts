import { getMyAttendance } from '../services/get-my-attendance.service';
import { getMyAttendanceHistory } from '../services/get-my-attendance-history.service';
import { getMyParticipation } from '../services/get-my-participation.service';
import type { AttendanceSelfHistoryPage } from '../types/attendance.types';
import { attendanceQueryKeys } from './attendance.keys';

/** Query options for the caller's own record on one session. */
export function buildMyAttendanceQueryOptions(teamId: string, sessionId: string) {
  return {
    queryKey: attendanceQueryKeys.self(teamId, sessionId),
    queryFn: () => getMyAttendance(teamId, sessionId),
    enabled: teamId !== '' && sessionId !== '',
  };
}

/** Query options for the caller's own participation summary. */
export function buildMyParticipationQueryOptions(teamId: string, seasonId: string | null) {
  return {
    queryKey: attendanceQueryKeys.participation(teamId, seasonId),
    queryFn: () => getMyParticipation(teamId, seasonId),
    enabled: teamId !== '',
  };
}

/**
 * Query options for one bounded window of the caller's own history. The key
 * holds the grown window size (load-more refetches one deterministic list);
 * `placeholderData` keeps the previous window visible while the next loads.
 */
export function buildMyAttendanceHistoryQueryOptions(teamId: string, limit: number) {
  return {
    queryKey: attendanceQueryKeys.selfHistory(teamId, limit),
    queryFn: () => getMyAttendanceHistory(teamId, limit),
    enabled: teamId !== '',
    placeholderData: (previous: AttendanceSelfHistoryPage | undefined) => previous,
  };
}
