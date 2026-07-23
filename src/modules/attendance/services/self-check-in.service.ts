import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestSelfCheckIn } from '../gateways/attendance-self.gateway';
import { mapAttendanceSelfRecord } from '../mappers/attendance-self.mapper';
import type { AttendanceSelfRecord } from '../types/attendance.types';

/** Use case: check the caller in; the server decides on-time versus late. */
export async function selfCheckIn(
  teamId: string,
  sessionId: string,
  note: string | null,
): Promise<AttendanceSelfRecord> {
  try {
    return mapAttendanceSelfRecord(await requestSelfCheckIn(teamId, sessionId, note));
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
