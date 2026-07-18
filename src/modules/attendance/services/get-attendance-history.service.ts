import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestAttendanceHistory } from '../gateways/attendance.gateway';
import { mapAttendanceHistory } from '../mappers/attendance.mapper';
import type { AttendanceRevision } from '../types/attendance.types';

export async function getAttendanceHistory(
  teamId: string,
  sessionId: string,
  membershipId: string,
): Promise<readonly AttendanceRevision[]> {
  try {
    return mapAttendanceHistory(await requestAttendanceHistory(teamId, sessionId, membershipId));
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
