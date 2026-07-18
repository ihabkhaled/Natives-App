import { APP_ERROR_CODE, type AppErrorCode } from '@/shared/errors';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

import {
  ATTENDANCE_QUEUE_STATE,
  ATTENDANCE_SHEET_STATE,
  type AttendanceQueueState,
} from '../constants/attendance.constants';
import type { AttendanceScreenStatus } from '../types/attendance-view.types';
import type { AttendanceSheet } from '../types/attendance.types';

export function resolveAttendanceScreenStatus(params: {
  readonly errorCode: AppErrorCode | null;
  readonly sheet: AttendanceSheet | undefined;
  readonly isOffline: boolean;
  readonly isLoading: boolean;
}): AttendanceScreenStatus {
  if (params.errorCode === APP_ERROR_CODE.Forbidden) {
    return 'forbidden';
  }
  if (params.sheet?.items.length === 0) {
    return 'empty';
  }
  if (params.sheet !== undefined) {
    return 'ready';
  }
  if (params.isOffline) {
    return 'offline';
  }
  if (params.isLoading || params.errorCode === null) {
    return 'loading';
  }
  return 'error';
}

export function attendanceQueueLabelKey(state: AttendanceQueueState | null): I18nKey {
  if (state === ATTENDANCE_QUEUE_STATE.pending) {
    return I18N_KEYS.attendance.queuePending;
  }
  if (state === ATTENDANCE_QUEUE_STATE.retrying) {
    return I18N_KEYS.attendance.queueRetrying;
  }
  if (state === ATTENDANCE_QUEUE_STATE.conflict) {
    return I18N_KEYS.attendance.queueConflict;
  }
  if (state === ATTENDANCE_QUEUE_STATE.failed) {
    return I18N_KEYS.attendance.queueFailed;
  }
  return I18N_KEYS.attendance.queueSynced;
}

export function attendanceSheetStateLabelKey(sheet: AttendanceSheet | undefined): I18nKey {
  if (sheet?.state === ATTENDANCE_SHEET_STATE.finalized) {
    return I18N_KEYS.attendance.sheetFinalized;
  }
  if (sheet?.state === ATTENDANCE_SHEET_STATE.corrected) {
    return I18N_KEYS.attendance.sheetCorrected;
  }
  return I18N_KEYS.attendance.sheetOpen;
}
