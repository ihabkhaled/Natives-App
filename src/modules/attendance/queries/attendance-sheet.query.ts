import { listAttendance } from '../services/list-attendance.service';
import { attendanceQueryKeys } from './attendance.keys';

export function buildAttendanceSheetQueryOptions(teamId: string, sessionId: string) {
  return {
    queryKey: attendanceQueryKeys.sheet(teamId, sessionId),
    queryFn: () => listAttendance(teamId, sessionId),
    enabled: teamId !== '' && sessionId !== '',
  };
}
