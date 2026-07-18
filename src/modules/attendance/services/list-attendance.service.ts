import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { ATTENDANCE_PAGE_SIZE } from '../constants/attendance.constants';
import { requestAttendanceSheet } from '../gateways/attendance.gateway';
import { mapAttendanceSheet } from '../mappers/attendance.mapper';
import type { AttendanceSheet } from '../types/attendance.types';

export async function listAttendance(teamId: string, sessionId: string): Promise<AttendanceSheet> {
  try {
    const dto = await requestAttendanceSheet(teamId, sessionId, ATTENDANCE_PAGE_SIZE, 0);
    return mapAttendanceSheet(dto);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
