import type { TranslateParams } from '@/packages/i18n';
import { APP_ERROR_CODE } from '@/shared/errors';
import { type AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';

import type { RsvpReason, RsvpStatus } from '../constants/practice.constants';
import {
  buildPracticeSessionDetailData,
  resolvePracticeSessionStatus,
} from './practice-session-view-model.helper';
import type { PracticeSessionScreenView } from '../types/practice-view.types';
import type { PracticeSessionDetail } from '../types/practice.types';

type Translate = (key: string, params?: TranslateParams) => string;

export interface BuildPracticeSessionScreenParams {
  readonly t: Translate;
  readonly locale: string;
  readonly detail: PracticeSessionDetail | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly now: string;
  readonly canRsvpSelf: boolean;
  readonly selectedReason: RsvpReason | null;
  readonly isSubmitting: boolean;
  readonly isConflict: boolean;
  readonly onRetry: () => void;
  readonly onSelectReason: (reason: RsvpReason | null) => void;
  readonly onSubmitRsvp: (status: RsvpStatus) => void;
  readonly onOpenMap: (url: string) => void;
}

/** Assemble the full translated session-detail screen view. */
export function buildPracticeSessionScreenView(
  params: BuildPracticeSessionScreenParams,
): PracticeSessionScreenView {
  const { t, locale, detail, error } = params;
  const isForbidden = error?.code === APP_ERROR_CODE.Forbidden;
  const detailData =
    detail === undefined
      ? null
      : buildPracticeSessionDetailData({
          t,
          locale,
          detail,
          nowIso: params.now,
          canRsvpSelf: params.canRsvpSelf,
        });
  return {
    title: detailData?.title ?? t(I18N_KEYS.practice.calendarTitle),
    status: resolvePracticeSessionStatus({
      hasData: detail !== undefined,
      isLoading: params.isLoading,
      isForbidden,
      isNotFound: error?.code === APP_ERROR_CODE.NotFound,
      hasError: error !== null,
      isOffline: params.isOffline,
    }),
    loadingLabel: t(I18N_KEYS.common.loading),
    errorTitle: t(I18N_KEYS.states.errorTitle),
    errorMessage: error === null ? '' : t(mapErrorCodeToI18nKey(error.code)),
    retryLabel: t(I18N_KEYS.common.retry),
    onRetry: params.onRetry,
    offlineTitle: t(I18N_KEYS.states.offlineTitle),
    offlineMessage: t(I18N_KEYS.states.offlineMessage),
    offlineNoticeLabel: t(I18N_KEYS.practice.offlineNotice),
    isOffline: params.isOffline,
    forbiddenTitle: t(I18N_KEYS.states.permissionTitle),
    forbiddenMessage: t(I18N_KEYS.states.permissionMessage),
    detail: detailData,
    selectedReason: params.selectedReason,
    onSelectReason: params.onSelectReason,
    onSubmitRsvp: params.onSubmitRsvp,
    isSubmitting: params.isSubmitting,
    conflictNote: params.isConflict ? t(I18N_KEYS.practice.rsvpConflict) : null,
    onOpenMap: params.onOpenMap,
  };
}
