import { formatCairoDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import type { AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';

import {
  ATTENDANCE_QUEUE_STATE,
  ATTENDANCE_SHEET_STATE,
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LABEL_KEYS,
  ATTENDANCE_STATUS_OPTIONS,
} from '../constants/attendance.constants';
import { mapAttendanceHistoryView } from '../mappers/attendance-history-view.mapper';
import { buildAttendanceRows } from './attendance-row-view.helper';
import {
  attendanceSheetStateLabelKey,
  resolveAttendanceScreenStatus,
} from './attendance-screen-state.helper';
import type { AttendanceEditorView } from '../hooks/use-attendance-editor.hook';
import type { AttendanceRosterRowView, AttendanceScreenView } from '../types/attendance-view.types';
import type {
  AttendanceQueuedOperation,
  AttendanceRevision,
  AttendanceSheet,
} from '../types/attendance.types';

type Translate = (key: string, params?: TranslateParams) => string;

export interface AttendanceScreenActions {
  readonly onRetry: () => void;
  readonly onSubmit: () => void;
  readonly onFinalize: () => void;
  readonly onRetryQueue: () => void;
  readonly onResolveConflict: (membershipId: string) => void;
  readonly onShowHistory: (membershipId: string) => void;
  readonly onSaveCorrection: (membershipId: string) => void;
}

export interface BuildAttendanceScreenParams {
  readonly t: Translate;
  readonly locale: string;
  readonly sessionId: string;
  readonly sheet: AttendanceSheet | undefined;
  readonly error: AppError | null;
  readonly isLoading: boolean;
  readonly isOffline: boolean;
  readonly editor: AttendanceEditorView;
  readonly queue: readonly AttendanceQueuedOperation[];
  readonly isReplaying: boolean;
  readonly isSubmitting: boolean;
  readonly isFinalizing: boolean;
  readonly isCorrecting: boolean;
  readonly historyMembershipId: string;
  readonly history: readonly AttendanceRevision[];
  readonly isHistoryLoading: boolean;
  readonly actions: AttendanceScreenActions;
}

function buildStateFields(params: BuildAttendanceScreenParams) {
  const { t } = params;
  return {
    title: t(I18N_KEYS.attendance.title),
    status: resolveAttendanceScreenStatus({
      errorCode: params.error?.code ?? null,
      sheet: params.sheet,
      isOffline: params.isOffline,
      isLoading: params.isLoading,
    }),
    loadingLabel: t(I18N_KEYS.common.loading),
    errorTitle: t(I18N_KEYS.states.errorTitle),
    errorMessage: params.error === null ? '' : t(mapErrorCodeToI18nKey(params.error.code)),
    retryLabel: t(I18N_KEYS.common.retry),
    offlineTitle: t(I18N_KEYS.states.offlineTitle),
    offlineMessage: t(I18N_KEYS.states.offlineMessage),
    forbiddenTitle: t(I18N_KEYS.states.permissionTitle),
    forbiddenMessage: t(I18N_KEYS.states.permissionMessage),
    emptyTitle: t(I18N_KEYS.attendance.emptyTitle),
    emptyMessage: t(I18N_KEYS.attendance.emptyMessage),
  };
}

function countMarked(sheet: AttendanceSheet | undefined, editor: AttendanceEditorView): number {
  return (
    sheet?.items.filter((entry) => editor.drafts[entry.membershipId]?.status !== null).length ?? 0
  );
}

function canFinalizeSheet(params: BuildAttendanceScreenParams, markedCount: number): boolean {
  return (
    params.sheet?.state === ATTENDANCE_SHEET_STATE.open &&
    params.sheet.version !== null &&
    markedCount === params.sheet.total &&
    params.queue.length === 0 &&
    params.editor.dirtyIds.length === 0 &&
    !params.isOffline
  );
}

function buildSummaryFields(params: BuildAttendanceScreenParams) {
  const { t, sheet, queue, editor } = params;
  const conflictCount = queue.filter(
    (operation) => operation.state === ATTENDANCE_QUEUE_STATE.conflict,
  ).length;
  const markedCount = countMarked(sheet, editor);
  return {
    sessionLabel: t(I18N_KEYS.attendance.sessionIdentifier, {
      identifier: params.sessionId.slice(-6),
    }),
    subtitle: t(I18N_KEYS.attendance.subtitle),
    sheetState: sheet?.state ?? null,
    sheetStateLabel: t(attendanceSheetStateLabelKey(sheet)),
    rosterSummary: t(I18N_KEYS.attendance.rosterSummary, {
      marked: markedCount,
      total: sheet?.total ?? 0,
    }),
    finalizedLabel:
      sheet?.finalizedAtIso == null
        ? null
        : t(I18N_KEYS.attendance.finalizedAt, {
            when: formatCairoDateTime(sheet.finalizedAtIso, params.locale),
          }),
    queueSummary: t(I18N_KEYS.attendance.queueSummary, {
      pending: queue.length - conflictCount,
      conflicts: conflictCount,
    }),
    canFinalize: canFinalizeSheet(params, markedCount),
  };
}

function buildControlFields(
  params: BuildAttendanceScreenParams,
  rows: readonly AttendanceRosterRowView[],
) {
  const { t, editor } = params;
  return {
    isOffline: params.isOffline,
    offlineQueueNotice: t(I18N_KEYS.attendance.offlineQueueNotice),
    privacyNotice: t(I18N_KEYS.attendance.privacyNotice),
    searchLabel: t(I18N_KEYS.attendance.searchLabel),
    searchPlaceholder: t(I18N_KEYS.attendance.searchPlaceholder),
    searchValue: editor.searchValue,
    filterLabel: t(I18N_KEYS.attendance.filterLabel),
    filterAllLabel: t(I18N_KEYS.attendance.filterAll),
    filterValue: editor.filterValue,
    statusOptions: ATTENDANCE_STATUS_OPTIONS.map((value) => ({
      value,
      label: t(ATTENDANCE_STATUS_LABEL_KEYS[value]),
    })),
    selectedCountLabel: t(I18N_KEYS.attendance.selectedCount, {
      count: editor.selectedIds.length,
    }),
    selectAllVisibleLabel: t(I18N_KEYS.attendance.selectAllVisible),
    rows,
    noMatchesTitle: t(I18N_KEYS.attendance.noMatchesTitle),
    noMatchesMessage: t(I18N_KEYS.attendance.noMatchesMessage),
  };
}

function buildMutationFields(params: BuildAttendanceScreenParams) {
  const { t, editor, queue } = params;
  return {
    markAllPresentLabel: t(I18N_KEYS.attendance.markAllPresent),
    markSelectedPresentLabel: t(I18N_KEYS.attendance.markSelectedPresent),
    markSelectedAbsentLabel: t(I18N_KEYS.attendance.markSelectedAbsent),
    undoLabel: t(I18N_KEYS.attendance.undo),
    saveLabel: t(
      params.isSubmitting ? I18N_KEYS.attendance.savingChanges : I18N_KEYS.attendance.saveChanges,
    ),
    finalizeLabel: t(
      params.isFinalizing ? I18N_KEYS.attendance.finalizing : I18N_KEYS.attendance.finalize,
    ),
    retryQueueLabel: t(I18N_KEYS.attendance.retryQueue),
    resolveConflictLabel: t(I18N_KEYS.attendance.resolveConflict),
    canUndo: editor.canUndo,
    canSubmit:
      editor.dirtyIds.length > 0 &&
      params.sheet?.state === ATTENDANCE_SHEET_STATE.open &&
      !params.isSubmitting,
    canRetryQueue: queue.some((operation) => operation.state === ATTENDANCE_QUEUE_STATE.failed),
    isSubmitting: params.isSubmitting,
    isFinalizing: params.isFinalizing,
    isCorrecting: params.isCorrecting,
    isReplaying: params.isReplaying,
  };
}

function buildHistoryFields(params: BuildAttendanceScreenParams) {
  const { t } = params;
  return {
    historyTitle: t(I18N_KEYS.attendance.historyTitle),
    historyEmptyLabel: t(I18N_KEYS.attendance.historyEmpty),
    historyLoadingLabel: t(I18N_KEYS.attendance.historyLoading),
    historyMembershipId: params.historyMembershipId || null,
    historyItems: mapAttendanceHistoryView(t, params.locale, params.history),
    isHistoryLoading: params.isHistoryLoading,
  };
}

function buildActionFields(
  params: BuildAttendanceScreenParams,
  rows: readonly AttendanceRosterRowView[],
) {
  const { editor, actions } = params;
  return {
    onRetry: actions.onRetry,
    onSearchChange: editor.setSearchValue,
    onFilterChange: editor.setFilterValue,
    onToggleMember: editor.toggleMember,
    onSelectAllVisible: () => {
      editor.selectMembers(rows.map((row) => row.membershipId));
    },
    onStatusChange: editor.setStatus,
    onLatenessChange: editor.setLateness,
    onExcuseChange: editor.setExcuse,
    onCorrectionReasonChange: editor.setCorrectionReason,
    onMarkAllPresent: editor.markAllPresent,
    onMarkSelectedPresent: () => {
      editor.markSelected(ATTENDANCE_STATUS.presentOnTime);
    },
    onMarkSelectedAbsent: () => {
      editor.markSelected(ATTENDANCE_STATUS.absent);
    },
    onUndo: editor.undo,
    onSubmit: actions.onSubmit,
    onFinalize: actions.onFinalize,
    onRetryQueue: actions.onRetryQueue,
    onResolveConflict: actions.onResolveConflict,
    onShowHistory: actions.onShowHistory,
    onSaveCorrection: actions.onSaveCorrection,
  };
}

export function buildAttendanceScreenView(
  params: BuildAttendanceScreenParams,
): AttendanceScreenView {
  const rows = buildAttendanceRows(params);
  return {
    ...buildStateFields(params),
    ...buildSummaryFields(params),
    ...buildControlFields(params, rows),
    ...buildMutationFields(params),
    ...buildHistoryFields(params),
    ...buildActionFields(params, rows),
  };
}
