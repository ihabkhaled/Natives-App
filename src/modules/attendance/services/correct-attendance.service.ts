import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestAttendanceCorrection } from '../gateways/attendance.gateway';
import { mapAttendanceRecord } from '../mappers/attendance.mapper';
import type { AttendanceCorrection, AttendanceRecord } from '../types/attendance.types';

export async function correctAttendance(
  teamId: string,
  sessionId: string,
  correction: AttendanceCorrection,
): Promise<AttendanceRecord> {
  try {
    return mapAttendanceRecord(await requestAttendanceCorrection(teamId, sessionId, correction));
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
