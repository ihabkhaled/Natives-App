import { getMyAttendance } from '../services/get-my-attendance.service';
import { getMyParticipation } from '../services/get-my-participation.service';
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
