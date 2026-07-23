import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestMyAttendance } from '../gateways/attendance-self.gateway';
import { mapAttendanceSelfRecord } from '../mappers/attendance-self.mapper';
import type { AttendanceSelfRecord } from '../types/attendance.types';

/** Use case: read the caller's own record for one session. */
export async function getMyAttendance(
  teamId: string,
  sessionId: string,
): Promise<AttendanceSelfRecord> {
  try {
    return mapAttendanceSelfRecord(await requestMyAttendance(teamId, sessionId));
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
