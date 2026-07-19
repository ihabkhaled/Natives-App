import { describe, expect, it } from 'vitest';

import {
  makeAttendanceSheet,
  makeQueuedOperation,
  makeRosterEntry,
} from '@/tests/msw/attendance-domain.fixture';
import { buildAttendanceEditorStub } from '@/tests/msw/attendance-editor.fixture';
import { AppError } from '@/shared/errors/app.errors';
import { APP_ERROR_CODE } from '@/shared/errors';
import { I18N_KEYS } from '@/shared/i18n';

import { ATTENDANCE_SHEET_STATE } from '../constants/attendance.constants';
import type { AttendanceScreenActions } from '../types/attendance-view.types';
import { buildAttendanceScreenView } from './attendance-view-model.helper';

const t = (key: string): string => key;

const NOOP_ACTIONS: AttendanceScreenActions = {
  onRetry: () => undefined,
  onSubmit: () => undefined,
  onFinalize: () => undefined,
  onRetryQueue: () => undefined,
  onResolveConflict: () => undefined,
  onShowHistory: () => undefined,
  onSaveCorrection: () => undefined,
};

const READY_DRAFTS = {
  'm-1': {
    status: 'present_on_time' as const,
    latenessMinutes: null,
    excuseCategory: null,
    expectedVersion: 1,
    correctionReason: '',
  },
  'm-2': {
    status: 'absent' as const,
    latenessMinutes: null,
    excuseCategory: null,
    expectedVersion: 1,
    correctionReason: '',
  },
};

describe('buildAttendanceScreenView', () => {
  it('composes the ready, dirty view with a retryable queue and no error', () => {
    const view = buildAttendanceScreenView({
      t,
      locale: 'en',
      sessionId: 'sess-abcdef',
      sheet: makeAttendanceSheet({
        items: [
          makeRosterEntry({ membershipId: 'm-1' }),
          makeRosterEntry({ membershipId: 'm-2', status: 'absent' }),
          makeRosterEntry({ membershipId: 'm-3', status: 'excused' }),
        ],
      }),
      error: null,
      isLoading: false,
      isOffline: false,
      editor: buildAttendanceEditorStub({ dirtyIds: ['m-1'], drafts: READY_DRAFTS }),
      queue: [
        makeQueuedOperation({ membershipId: 'm-1', state: 'conflict' }),
        makeQueuedOperation({ operationId: 'op-2', membershipId: 'm-2', state: 'failed' }),
      ],
      isReplaying: false,
      isSubmitting: false,
      isFinalizing: false,
      isCorrecting: false,
      historyMembershipId: '',
      history: [],
      isHistoryLoading: false,
      actions: NOOP_ACTIONS,
    });

    expect(view.status).toBe('ready');
    expect(view.errorMessage).toBe('');
    expect(view.finalizedLabel).toBeNull();
    expect(view.canSubmit).toBe(true);
    expect(view.canRetryQueue).toBe(true);
    expect(view.canFinalize).toBe(false);
    expect(view.saveLabel).toBe(I18N_KEYS.attendance.saveChanges);
    expect(view.finalizeLabel).toBe(I18N_KEYS.attendance.finalize);
    expect(view.historyMembershipId).toBeNull();

    // Cover the wired action callbacks.
    expect(() => {
      view.onSelectAllVisible();
      view.onMarkSelectedPresent();
      view.onMarkSelectedAbsent();
      view.onRetry();
    }).not.toThrow();
  });

  it('reflects in-flight submit/finalize, a finalized sheet, an error, and an open history panel', () => {
    const view = buildAttendanceScreenView({
      t,
      locale: 'en',
      sessionId: 'sess-abcdef',
      sheet: makeAttendanceSheet({
        state: ATTENDANCE_SHEET_STATE.finalized,
        finalizedAtIso: '2026-07-26T17:10:00.000Z',
        version: 4,
      }),
      error: new AppError({ code: APP_ERROR_CODE.Unexpected }),
      isLoading: false,
      isOffline: false,
      editor: buildAttendanceEditorStub({
        drafts: {
          'm-1': {
            status: null,
            latenessMinutes: null,
            excuseCategory: null,
            expectedVersion: 1,
            correctionReason: '',
          },
        },
      }),
      queue: [],
      isReplaying: false,
      isSubmitting: true,
      isFinalizing: true,
      isCorrecting: false,
      historyMembershipId: 'm-1',
      history: [],
      isHistoryLoading: false,
      actions: NOOP_ACTIONS,
    });

    expect(view.errorMessage).not.toBe('');
    expect(view.saveLabel).toBe(I18N_KEYS.attendance.savingChanges);
    expect(view.finalizeLabel).toBe(I18N_KEYS.attendance.finalizing);
    expect(view.finalizedLabel).not.toBeNull();
    expect(view.canSubmit).toBe(false);
    expect(view.canFinalize).toBe(false);
    expect(view.historyMembershipId).toBe('m-1');
  });

  it('allows finalizing a fully marked, clean, online open sheet', () => {
    const view = buildAttendanceScreenView({
      t,
      locale: 'en',
      sessionId: 'sess-abcdef',
      sheet: makeAttendanceSheet({ items: [makeRosterEntry({ membershipId: 'm-1' })] }),
      error: null,
      isLoading: false,
      isOffline: false,
      editor: buildAttendanceEditorStub({
        drafts: {
          'm-1': {
            status: 'present_on_time',
            latenessMinutes: null,
            excuseCategory: null,
            expectedVersion: 1,
            correctionReason: '',
          },
        },
      }),
      queue: [],
      isReplaying: false,
      isSubmitting: false,
      isFinalizing: false,
      isCorrecting: false,
      historyMembershipId: '',
      history: [],
      isHistoryLoading: false,
      actions: NOOP_ACTIONS,
    });

    expect(view.canFinalize).toBe(true);
  });

  it('renders a loading view with summary fallbacks when no sheet has loaded', () => {
    const view = buildAttendanceScreenView({
      t,
      locale: 'en',
      sessionId: 'sess-abcdef',
      sheet: undefined,
      error: null,
      isLoading: true,
      isOffline: false,
      editor: buildAttendanceEditorStub(),
      queue: [],
      isReplaying: false,
      isSubmitting: false,
      isFinalizing: false,
      isCorrecting: false,
      historyMembershipId: '',
      history: [],
      isHistoryLoading: false,
      actions: NOOP_ACTIONS,
    });

    expect(view.status).toBe('loading');
    expect(view.sheetState).toBeNull();
    expect(view.rows).toEqual([]);
    expect(view.canFinalize).toBe(false);
  });
});
