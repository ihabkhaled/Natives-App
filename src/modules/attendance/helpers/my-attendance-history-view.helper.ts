import { PRACTICE_TYPE_LABEL_KEYS, type PracticeType } from '@/modules/practice';
import { formatCairoDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  ATTENDANCE_EXCUSE_LABEL_KEYS,
  ATTENDANCE_SHEET_STATE,
  ATTENDANCE_SOURCE,
  ATTENDANCE_STATUS_LABEL_KEYS,
  type AttendanceSource,
} from '../constants/attendance.constants';
import type { SelfHistoryListView, SelfHistoryRowView } from '../types/attendance-view.types';
import type {
  AttendanceSelfHistoryEntry,
  AttendanceSelfHistoryPage,
} from '../types/attendance.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** "Recorded by you/your coach" — shared by the check-in card and history rows. */
export function attendanceSourceMessage(t: Translate, source: AttendanceSource | null): string {
  return t(
    source === ATTENDANCE_SOURCE.self
      ? I18N_KEYS.attendance.checkInRecordedSelf
      : I18N_KEYS.attendance.checkInRecordedStaff,
  );
}

export interface BuildHistorySectionParams {
  readonly t: Translate;
  readonly locale: string;
  readonly history: AttendanceSelfHistoryPage | undefined;
  readonly isHistoryLoading: boolean;
  readonly canGrowHistory: boolean;
  readonly onLoadMoreHistory: () => void;
}

function sessionTypeLabel(t: Translate, sessionType: string): string {
  return Object.hasOwn(PRACTICE_TYPE_LABEL_KEYS, sessionType)
    ? t(PRACTICE_TYPE_LABEL_KEYS[sessionType as PracticeType])
    : sessionType;
}

function buildHistoryRow(
  params: BuildHistorySectionParams,
  entry: AttendanceSelfHistoryEntry,
): SelfHistoryRowView {
  const { t } = params;
  return {
    sessionId: entry.sessionId,
    dateLabel: formatCairoDateTime(entry.startsAtIso, params.locale),
    typeLabel: sessionTypeLabel(t, entry.sessionType),
    statusLabel:
      entry.status === null
        ? t(I18N_KEYS.attendance.historyNotRecorded)
        : t(ATTENDANCE_STATUS_LABEL_KEYS[entry.status]),
    statusTone: entry.status === null ? 'medium' : 'success',
    latenessLabel:
      entry.latenessMinutes === null || entry.latenessMinutes === 0
        ? null
        : t(I18N_KEYS.attendance.historyLateness, { minutes: entry.latenessMinutes }),
    excuseLabel:
      entry.excuseCategory === null ? null : t(ATTENDANCE_EXCUSE_LABEL_KEYS[entry.excuseCategory]),
    sourceLabel: entry.source === null ? null : attendanceSourceMessage(t, entry.source),
    notFinalizedHint:
      entry.sheetState === ATTENDANCE_SHEET_STATE.open
        ? t(I18N_KEYS.attendance.historyNotFinalizedHint)
        : null,
  };
}

/**
 * The bounded newest-first history section: fully translated rows, an honest
 * empty state, and a load-more affordance that only offers itself while the
 * window can still grow AND the server reports rows beyond it.
 */
export function buildHistorySection(params: BuildHistorySectionParams): SelfHistoryListView {
  const { t, history } = params;
  const rows =
    history === undefined ? [] : history.items.map((entry) => buildHistoryRow(params, entry));
  return {
    title: t(I18N_KEYS.attendance.historySelfTitle),
    isLoading: history === undefined && params.isHistoryLoading,
    loadingLabel: t(I18N_KEYS.common.loading),
    rows,
    emptyTitle: t(I18N_KEYS.attendance.selfEmptyTitle),
    emptyMessage: t(I18N_KEYS.attendance.selfEmptyMessage),
    loadMoreLabel: t(I18N_KEYS.attendance.historyLoadMore),
    canLoadMore:
      history !== undefined && params.canGrowHistory && history.items.length < history.total,
    onLoadMore: params.onLoadMoreHistory,
  };
}
