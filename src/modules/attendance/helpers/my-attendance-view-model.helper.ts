import { formatCairoDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { APP_ERROR_CODE } from '@/shared/errors';
import type { AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';

import {
  ATTENDANCE_STATUS_LABEL_KEYS,
  SELF_CHECK_IN_STATE,
  type SelfCheckInState,
} from '../constants/attendance.constants';
import {
  attendanceSourceMessage,
  buildHistorySection,
  type BuildHistorySectionParams,
} from './my-attendance-history-view.helper';
import type {
  AttendanceScreenStatus,
  MyAttendanceScreenView,
  SelfCheckInCardView,
} from '../types/attendance-view.types';
import type { AttendanceParticipation, AttendanceSelfRecord } from '../types/attendance.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The slice of a practice summary this screen reads; supplied by the hook. */
export interface CheckInSessionContext {
  readonly id: string;
  readonly title: string | null;
  readonly startAtIso: string;
}

export interface BuildMyAttendanceParams extends BuildHistorySectionParams {
  readonly t: Translate;
  readonly isOffline: boolean;
  readonly isLoading: boolean;
  readonly participation: AttendanceParticipation | undefined;
  readonly participationError: AppError | null;
  readonly onRetry: () => void;
  readonly nextSession: CheckInSessionContext | null;
  readonly selfRecord: AttendanceSelfRecord | undefined;
  readonly isSelfLoading: boolean;
  readonly noteValue: string;
  readonly isSubmitting: boolean;
  readonly onNoteChange: (value: string) => void;
  readonly onCheckIn: () => void;
}

/** The fresh-DB "no approved rule yet" answer is configuration, not failure. */
function isRuleMissing(error: AppError | null): boolean {
  return error?.messageKey === I18N_KEYS.errors.practices.attendanceRuleMissing;
}

function resolveStatus(params: BuildMyAttendanceParams): AttendanceScreenStatus {
  if (params.participation !== undefined || isRuleMissing(params.participationError)) {
    return 'ready';
  }
  if (params.participationError?.code === APP_ERROR_CODE.Forbidden) {
    return 'forbidden';
  }
  if (params.isLoading) {
    return 'loading';
  }
  if (params.isOffline) {
    return 'offline';
  }
  return params.participationError === null ? 'loading' : 'error';
}

const BREAKDOWN_COUNTS = [
  ['onTime', ATTENDANCE_STATUS_LABEL_KEYS.present_on_time],
  ['late', ATTENDANCE_STATUS_LABEL_KEYS.present_late],
  ['excused', ATTENDANCE_STATUS_LABEL_KEYS.excused],
  ['injured', ATTENDANCE_STATUS_LABEL_KEYS.injured],
  ['absent', ATTENDANCE_STATUS_LABEL_KEYS.absent],
  ['remoteApproved', ATTENDANCE_STATUS_LABEL_KEYS.remote_approved],
  ['otherApproved', ATTENDANCE_STATUS_LABEL_KEYS.other_approved],
] as const;

function buildParticipationCard(
  params: BuildMyAttendanceParams,
): MyAttendanceScreenView['participation'] {
  const { t, participation } = params;
  const shared = {
    title: t(I18N_KEYS.attendance.participationTitle),
    rateLabel: t(I18N_KEYS.attendance.participationRateLabel),
    notConfiguredMessage: t(I18N_KEYS.attendance.participationNotConfigured),
  };
  if (participation === undefined) {
    if (!isRuleMissing(params.participationError)) {
      return null;
    }
    return {
      ...shared,
      rateText: '',
      hasRate: false,
      breakdown: [],
      ruleNotice: '',
      candidateNotice: null,
      isNotConfigured: true,
    };
  }
  const hasRate = participation.attendanceRatePercent !== null;
  return {
    ...shared,
    rateText: hasRate
      ? `${String(participation.attendanceRatePercent)}%`
      : t(I18N_KEYS.attendance.participationNotEnoughData),
    hasRate,
    breakdown: BREAKDOWN_COUNTS.map(([key, labelKey]) => ({
      key,
      label: t(labelKey),
      valueText: String(participation[key]),
    })),
    ruleNotice: t(I18N_KEYS.attendance.participationFinalizedOnly, {
      version: participation.ruleVersion,
    }),
    candidateNotice:
      participation.ruleStatus === 'candidate'
        ? t(I18N_KEYS.attendance.participationRuleCandidate, {
            version: participation.ruleVersion,
          })
        : null,
    isNotConfigured: false,
  };
}

function buildRecordedChip(
  t: Translate,
  record: AttendanceSelfRecord,
): SelfCheckInCardView['statusChip'] {
  if (record.status === null) {
    return null;
  }
  return { label: t(ATTENDANCE_STATUS_LABEL_KEYS[record.status]), tone: 'success' };
}

/**
 * The server-ruled eligibility state is the single source of truth. Responses
 * without the block (writes never compute it) can only read as "not
 * checkable": a recorded mark stays `recorded`, anything else is `closed` —
 * the client never re-derives the window on its own clock.
 */
function resolveCheckInState(record: AttendanceSelfRecord): SelfCheckInState {
  if (record.selfCheckIn !== null) {
    return record.selfCheckIn.state;
  }
  return record.status === null ? SELF_CHECK_IN_STATE.closed : SELF_CHECK_IN_STATE.recorded;
}

function stateMessageFor(
  params: BuildMyAttendanceParams,
  record: AttendanceSelfRecord,
): string | null {
  const { t } = params;
  const block = record.selfCheckIn;
  if (block === null) {
    return record.status === null
      ? t(I18N_KEYS.attendance.checkInClosed)
      : attendanceSourceMessage(t, record.source);
  }
  switch (block.state) {
    case SELF_CHECK_IN_STATE.recorded:
      return attendanceSourceMessage(t, record.source);
    case SELF_CHECK_IN_STATE.locked:
      return t(I18N_KEYS.attendance.checkInLocked);
    case SELF_CHECK_IN_STATE.closed:
      return t(I18N_KEYS.attendance.checkInClosed);
    case SELF_CHECK_IN_STATE.notOpen:
      return t(I18N_KEYS.attendance.checkInOpensAt, {
        when: formatCairoDateTime(block.opensAtIso, params.locale),
      });
    case SELF_CHECK_IN_STATE.open:
      return null;
  }
}

/** The action-side facts an OPEN server state controls; others zero them. */
function buildOpenState(
  params: BuildMyAttendanceParams,
  state: SelfCheckInState,
): Pick<SelfCheckInCardView, 'offlineNotice' | 'canCheckIn'> {
  if (state !== SELF_CHECK_IN_STATE.open) {
    return { offlineNotice: null, canCheckIn: false };
  }
  if (params.isOffline) {
    return {
      offlineNotice: params.t(I18N_KEYS.attendance.checkInOfflineNotice),
      canCheckIn: false,
    };
  }
  return { offlineNotice: null, canCheckIn: !params.isSubmitting };
}

function buildCheckInCard(params: BuildMyAttendanceParams): SelfCheckInCardView {
  const { t, nextSession, selfRecord } = params;
  const shared = {
    title: t(I18N_KEYS.attendance.checkInTitle),
    noSessionMessage: t(I18N_KEYS.attendance.checkInNoSession),
    loadingLabel: t(I18N_KEYS.common.loading),
    checkInLabel: t(I18N_KEYS.attendance.checkInAction),
    noteLabel: t(I18N_KEYS.attendance.checkInNote),
    noteValue: params.noteValue,
    isSubmitting: params.isSubmitting,
    onNoteChange: params.onNoteChange,
    onCheckIn: params.onCheckIn,
  };
  if (nextSession === null || selfRecord === undefined) {
    return {
      ...shared,
      sessionLabel: null,
      isLoading: nextSession !== null && params.isSelfLoading,
      statusChip: null,
      stateMessage: null,
      offlineNotice: null,
      canCheckIn: false,
    };
  }
  const state = resolveCheckInState(selfRecord);
  const timeLabel = formatCairoDateTime(nextSession.startAtIso, params.locale);
  return {
    ...shared,
    sessionLabel: nextSession.title === null ? timeLabel : `${nextSession.title} · ${timeLabel}`,
    isLoading: false,
    statusChip: buildRecordedChip(t, selfRecord),
    stateMessage: stateMessageFor(params, selfRecord),
    ...buildOpenState(params, state),
  };
}

export function buildMyAttendanceScreenView(
  params: BuildMyAttendanceParams,
): MyAttendanceScreenView {
  const { t } = params;
  const error = params.participationError;
  const stateCopy: Record<
    | 'loadingLabel'
    | 'errorTitle'
    | 'retryLabel'
    | 'offlineTitle'
    | 'offlineMessage'
    | 'forbiddenTitle'
    | 'forbiddenMessage'
    | 'emptyTitle'
    | 'emptyMessage',
    string
  > = {
    loadingLabel: t(I18N_KEYS.common.loading),
    errorTitle: t(I18N_KEYS.states.errorTitle),
    retryLabel: t(I18N_KEYS.common.retry),
    offlineTitle: t(I18N_KEYS.states.offlineTitle),
    offlineMessage: t(I18N_KEYS.states.offlineMessage),
    forbiddenTitle: t(I18N_KEYS.states.permissionTitle),
    forbiddenMessage: t(I18N_KEYS.states.permissionMessage),
    emptyTitle: t(I18N_KEYS.attendance.selfEmptyTitle),
    emptyMessage: t(I18N_KEYS.attendance.selfEmptyMessage),
  };
  return {
    ...stateCopy,
    title: t(I18N_KEYS.attendance.selfTitle),
    subtitle: t(I18N_KEYS.attendance.selfSubtitle),
    privacyNotice: t(I18N_KEYS.attendance.selfPrivacyNotice),
    status: resolveStatus(params),
    errorMessage: error === null ? '' : t(mapErrorCodeToI18nKey(error.code)),
    onRetry: params.onRetry,
    participation: buildParticipationCard(params),
    checkIn: buildCheckInCard(params),
    history: buildHistorySection(params),
  };
}
