import { describe, expect, it } from 'vitest';

import { makeAttendanceSheet as sheet } from '@/tests/msw/attendance-domain.fixture';
import { APP_ERROR_CODE } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';

import { ATTENDANCE_QUEUE_STATE, ATTENDANCE_SHEET_STATE } from '../constants/attendance.constants';
import {
  attendanceQueueLabelKey,
  attendanceSheetStateLabelKey,
  resolveAttendanceScreenStatus,
} from './attendance-screen-state.helper';

describe('resolveAttendanceScreenStatus', () => {
  it('returns forbidden regardless of the loaded sheet', () => {
    expect(
      resolveAttendanceScreenStatus({
        errorCode: APP_ERROR_CODE.Forbidden,
        sheet: sheet(),
        isOffline: false,
        isLoading: false,
      }),
    ).toBe('forbidden');
  });

  it('returns empty for a sheet with no roster entries', () => {
    expect(
      resolveAttendanceScreenStatus({
        errorCode: null,
        sheet: sheet({ items: [], total: 0 }),
        isOffline: false,
        isLoading: false,
      }),
    ).toBe('empty');
  });

  it('returns ready for a populated sheet', () => {
    expect(
      resolveAttendanceScreenStatus({
        errorCode: null,
        sheet: sheet(),
        isOffline: false,
        isLoading: false,
      }),
    ).toBe('ready');
  });

  it('returns offline when there is no sheet and the device is offline', () => {
    expect(
      resolveAttendanceScreenStatus({
        errorCode: null,
        sheet: undefined,
        isOffline: true,
        isLoading: false,
      }),
    ).toBe('offline');
  });

  it('returns loading while fetching or before any error resolves', () => {
    expect(
      resolveAttendanceScreenStatus({
        errorCode: null,
        sheet: undefined,
        isOffline: false,
        isLoading: true,
      }),
    ).toBe('loading');
    expect(
      resolveAttendanceScreenStatus({
        errorCode: null,
        sheet: undefined,
        isOffline: false,
        isLoading: false,
      }),
    ).toBe('loading');
  });

  it('returns error for a non-forbidden failure with no sheet', () => {
    expect(
      resolveAttendanceScreenStatus({
        errorCode: APP_ERROR_CODE.Unexpected,
        sheet: undefined,
        isOffline: false,
        isLoading: false,
      }),
    ).toBe('error');
  });
});

describe('attendanceQueueLabelKey', () => {
  it('maps each queue state to its label key', () => {
    expect(attendanceQueueLabelKey(ATTENDANCE_QUEUE_STATE.pending)).toBe(
      I18N_KEYS.attendance.queuePending,
    );
    expect(attendanceQueueLabelKey(ATTENDANCE_QUEUE_STATE.retrying)).toBe(
      I18N_KEYS.attendance.queueRetrying,
    );
    expect(attendanceQueueLabelKey(ATTENDANCE_QUEUE_STATE.conflict)).toBe(
      I18N_KEYS.attendance.queueConflict,
    );
    expect(attendanceQueueLabelKey(ATTENDANCE_QUEUE_STATE.failed)).toBe(
      I18N_KEYS.attendance.queueFailed,
    );
    expect(attendanceQueueLabelKey(null)).toBe(I18N_KEYS.attendance.queueSynced);
  });
});

describe('attendanceSheetStateLabelKey', () => {
  it('maps each sheet lifecycle state to its label key', () => {
    expect(attendanceSheetStateLabelKey(sheet({ state: ATTENDANCE_SHEET_STATE.finalized }))).toBe(
      I18N_KEYS.attendance.sheetFinalized,
    );
    expect(attendanceSheetStateLabelKey(sheet({ state: ATTENDANCE_SHEET_STATE.corrected }))).toBe(
      I18N_KEYS.attendance.sheetCorrected,
    );
    expect(attendanceSheetStateLabelKey(sheet())).toBe(I18N_KEYS.attendance.sheetOpen);
    expect(attendanceSheetStateLabelKey(undefined)).toBe(I18N_KEYS.attendance.sheetOpen);
  });
});
