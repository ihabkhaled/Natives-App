import { TEST_IDS } from '@/shared/config';

export const MY_ATTENDANCE_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.myAttendanceLoading,
  errorTestId: TEST_IDS.myAttendanceError,
  offlineTestId: TEST_IDS.myAttendanceOffline,
  forbiddenTestId: TEST_IDS.myAttendanceForbidden,
  emptyTestId: TEST_IDS.myAttendanceEmpty,
} as const;
