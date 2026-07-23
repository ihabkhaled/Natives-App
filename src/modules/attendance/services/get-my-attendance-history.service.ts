import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestMyAttendanceHistory } from '../gateways/attendance-self.gateway';
import { mapAttendanceSelfHistory } from '../mappers/attendance-self.mapper';
import type { AttendanceSelfHistoryPage } from '../types/attendance.types';

/** Use case: read one bounded page of the caller's own attendance history. */
export async function getMyAttendanceHistory(
  teamId: string,
  limit: number,
): Promise<AttendanceSelfHistoryPage> {
  try {
    return mapAttendanceSelfHistory(await requestMyAttendanceHistory(teamId, limit));
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
