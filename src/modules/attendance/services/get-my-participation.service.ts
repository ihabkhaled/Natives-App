import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestMyParticipation } from '../gateways/attendance-self.gateway';
import { mapAttendanceParticipation } from '../mappers/attendance-self.mapper';
import type { AttendanceParticipation } from '../types/attendance.types';

/** Use case: read the caller's own participation summary. */
export async function getMyParticipation(
  teamId: string,
  seasonId: string | null,
): Promise<AttendanceParticipation> {
  try {
    return mapAttendanceParticipation(await requestMyParticipation(teamId, seasonId));
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
