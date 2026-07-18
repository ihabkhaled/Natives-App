import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestAttendanceFinalization } from '../gateways/attendance.gateway';
import { mapAttendanceFinalization } from '../mappers/attendance.mapper';
import type { AttendanceFinalization } from '../types/attendance.types';

export async function finalizeAttendance(
  teamId: string,
  sessionId: string,
  expectedVersion: number,
): Promise<AttendanceFinalization> {
  try {
    return mapAttendanceFinalization(
      await requestAttendanceFinalization(teamId, sessionId, expectedVersion),
    );
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
