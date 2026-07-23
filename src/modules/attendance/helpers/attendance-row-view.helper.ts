import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  ATTENDANCE_EXCUSE_LABEL_KEYS,
  ATTENDANCE_EXCUSE_OPTIONS,
  ATTENDANCE_QUEUE_STATE,
  ATTENDANCE_SHEET_STATE,
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LABEL_KEYS,
  ATTENDANCE_STATUS_OPTIONS,
} from '../constants/attendance.constants';
import { attendanceQueueLabelKey } from './attendance-screen-state.helper';
import type { AttendanceEditorView } from '../hooks/use-attendance-editor.hook';
import type { AttendanceOption, AttendanceRosterRowView } from '../types/attendance-view.types';
import type {
  AttendanceDraft,
  AttendanceQueuedOperation,
  AttendanceRosterEntry,
  AttendanceSheet,
} from '../types/attendance.types';
import type { AttendanceExcuse, AttendanceStatus } from '../constants/attendance.constants';

type Translate = (key: string, params?: TranslateParams) => string;

export interface BuildAttendanceRowsParams {
  readonly t: Translate;
  readonly locale: string;
  readonly sheet: AttendanceSheet | undefined;
  readonly editor: AttendanceEditorView;
  readonly queue: readonly AttendanceQueuedOperation[];
  /**
   * Whether the effective session holds `attendance.correct`. Without it a
   * locked sheet renders read-only instead of offering a correction that the
   * backend will refuse with a 403.
   */
  readonly hasCorrectGrant: boolean;
}

interface BuildRowContext {
  readonly params: BuildAttendanceRowsParams;
  readonly statusOptions: readonly AttendanceOption<AttendanceStatus>[];
  readonly excuseOptions: readonly AttendanceOption<AttendanceExcuse>[];
  readonly queueByMember: ReadonlyMap<string, AttendanceQueuedOperation>;
}

function resolveDraft(
  entry: AttendanceRosterEntry,
  drafts: Readonly<Record<string, AttendanceDraft>>,
): AttendanceDraft {
  const draft = drafts[entry.membershipId];
  return (
    draft ?? {
      status: entry.status,
      latenessMinutes: entry.latenessMinutes,
      excuseCategory: entry.excuseCategory,
      expectedVersion: entry.version,
      correctionReason: '',
    }
  );
}

function latenessText(value: number | null): string {
  return value === null ? '' : String(value);
}

function conflictMessage(t: Translate, operation: AttendanceQueuedOperation | null): string | null {
  return operation?.state === ATTENDANCE_QUEUE_STATE.conflict
    ? t(I18N_KEYS.attendance.conflictMessage)
    : null;
}

function playerLabel(t: Translate, isHistorical: boolean, index: number): string {
  return t(
    isHistorical ? I18N_KEYS.attendance.historicalPlayerLabel : I18N_KEYS.attendance.playerLabel,
    { index: index + 1 },
  );
}

function canSaveCorrection(draft: AttendanceDraft): boolean {
  return draft.status !== null && draft.correctionReason.trim().length > 0;
}

/** Lock posture of one row: locked sheets edit only through the correct grant. */
function lockFlags(
  sheet: AttendanceSheet | undefined,
  hasCorrectGrant: boolean,
): Pick<AttendanceRosterRowView, 'isLocked' | 'showCorrectionEditor' | 'isReadOnly'> {
  const isLocked = sheet?.state !== ATTENDANCE_SHEET_STATE.open;
  return {
    isLocked,
    showCorrectionEditor: isLocked && hasCorrectGrant,
    isReadOnly: isLocked && !hasCorrectGrant,
  };
}

function buildRow(
  context: BuildRowContext,
  entry: AttendanceRosterEntry,
  index: number,
): AttendanceRosterRowView {
  const { params, statusOptions, excuseOptions, queueByMember } = context;
  const { t, editor, sheet } = params;
  const draft = resolveDraft(entry, editor.drafts);
  const operation = queueByMember.get(entry.membershipId) ?? null;
  const isHistorical = entry.userId === null;
  const label = playerLabel(t, isHistorical, index);
  return {
    ...lockFlags(sheet, params.hasCorrectGrant),
    membershipId: entry.membershipId,
    playerLabel: label,
    memberIdentifierLabel: t(I18N_KEYS.attendance.memberIdentifier, {
      identifier: entry.membershipId.slice(-6),
    }),
    rsvpLabel: t(I18N_KEYS.attendance.rsvpUnavailable),
    isHistorical,
    historicalLabel: t(I18N_KEYS.attendance.historicalBadge),
    isSelected: editor.selectedIds.includes(entry.membershipId),
    selectLabel: t(I18N_KEYS.attendance.selectPlayer, { player: label }),
    status: draft.status,
    statusLabel: t(I18N_KEYS.attendance.attendanceStatusLabel),
    statusOptions,
    latenessMinutes: latenessText(draft.latenessMinutes),
    showLateness: draft.status === ATTENDANCE_STATUS.presentLate,
    latenessLabel: t(I18N_KEYS.attendance.latenessLabel),
    excuseCategory: draft.excuseCategory,
    showExcuse: draft.status === ATTENDANCE_STATUS.excused,
    excuseLabel: t(I18N_KEYS.attendance.excuseLabel),
    excuseNoneLabel: t(I18N_KEYS.attendance.excuseNone),
    excuseOptions,
    queueState: operation?.state ?? null,
    syncLabel: t(attendanceQueueLabelKey(operation?.state ?? null)),
    conflictMessage: conflictMessage(t, operation),
    correctionReason: draft.correctionReason,
    correctionReasonLabel: t(I18N_KEYS.attendance.correctionReasonLabel),
    correctionReasonPlaceholder: t(I18N_KEYS.attendance.correctionReasonPlaceholder),
    canSaveCorrection: canSaveCorrection(draft),
    historyLabel: t(I18N_KEYS.attendance.history),
    saveCorrectionLabel: t(I18N_KEYS.attendance.saveCorrection),
  };
}

function rowMatches(
  row: AttendanceRosterRowView,
  query: string,
  filter: AttendanceStatus | null,
  locale: string,
): boolean {
  const matchesQuery =
    query === '' ||
    row.playerLabel.toLocaleLowerCase(locale).includes(query) ||
    row.memberIdentifierLabel.toLocaleLowerCase(locale).includes(query);
  return matchesQuery && (filter === null || row.status === filter);
}

export function buildAttendanceRows(
  params: BuildAttendanceRowsParams,
): readonly AttendanceRosterRowView[] {
  if (params.sheet === undefined) {
    return [];
  }
  const statusOptions = ATTENDANCE_STATUS_OPTIONS.map((value) => ({
    value,
    label: params.t(ATTENDANCE_STATUS_LABEL_KEYS[value]),
  }));
  const excuseOptions = ATTENDANCE_EXCUSE_OPTIONS.map((value) => ({
    value,
    label: params.t(ATTENDANCE_EXCUSE_LABEL_KEYS[value]),
  }));
  const queueByMember = new Map(params.queue.map((item) => [item.membershipId, item]));
  const query = params.editor.searchValue.trim().toLocaleLowerCase(params.locale);
  const context = { params, statusOptions, excuseOptions, queueByMember };
  return params.sheet.items
    .map((entry, index) => buildRow(context, entry, index))
    .filter((row) => rowMatches(row, query, params.editor.filterValue, params.locale));
}
