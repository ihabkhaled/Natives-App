import { getAttendanceHistory } from '../services/get-attendance-history.service';
import { attendanceQueryKeys } from './attendance.keys';

export function buildAttendanceHistoryQueryOptions(
  teamId: string,
  sessionId: string,
  membershipId: string,
) {
  return {
    queryKey: attendanceQueryKeys.history(teamId, sessionId, membershipId),
    queryFn: () => getAttendanceHistory(teamId, sessionId, membershipId),
    enabled: teamId !== '' && sessionId !== '' && membershipId !== '',
  };
}
