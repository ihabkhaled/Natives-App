import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestBulkAttendance } from '../gateways/attendance.gateway';
import { mapAttendanceBulkResult } from '../mappers/attendance.mapper';
import type { AttendanceBulkResult, AttendanceMark } from '../types/attendance.types';

export async function submitBulkAttendance(
  teamId: string,
  sessionId: string,
  marks: readonly AttendanceMark[],
): Promise<AttendanceBulkResult> {
  try {
    return mapAttendanceBulkResult(await requestBulkAttendance(teamId, sessionId, marks));
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
