import { useRouteParam } from '@/packages/router';

import { ATTENDANCE_SESSION_ID_PARAM } from '../routes/attendance.paths';
import type { AttendanceScreenView } from '../types/attendance-view.types';
import { useAttendanceScreen } from './use-attendance-screen.hook';

export function useAttendanceRouteScreen(): AttendanceScreenView {
  const sessionId = useRouteParam(ATTENDANCE_SESSION_ID_PARAM) ?? '';
  return useAttendanceScreen(sessionId);
}
