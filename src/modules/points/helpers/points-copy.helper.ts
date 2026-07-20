import type { TranslateParams } from '@/packages/i18n';
import type { AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';

import type { PointsScreenCopy } from '../types/points-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

export interface PointsCopyInput {
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly onRetry: () => void;
}

/** The async + guard + empty copy block both points screens share. */
export function buildPointsScreenCopy(t: Translate, input: PointsCopyInput): PointsScreenCopy {
  const errorMessage =
    input.error === null
      ? t(I18N_KEYS.points.errorMessage)
      : t(mapErrorCodeToI18nKey(input.error.code));
  return {
    loadingLabel: t(I18N_KEYS.points.loadingLabel),
    errorTitle: t(I18N_KEYS.points.errorTitle),
    errorMessage,
    retryLabel: t(I18N_KEYS.points.retry),
    onRetry: input.onRetry,
    offlineTitle: t(I18N_KEYS.points.offlineTitle),
    offlineMessage: t(I18N_KEYS.points.offlineMessage),
    offlineNoticeLabel: t(I18N_KEYS.points.offlineMessage),
    isOffline: input.isOffline,
    forbiddenTitle: t(I18N_KEYS.points.forbiddenTitle),
    forbiddenMessage: t(I18N_KEYS.points.forbiddenMessage),
    emptyTitle: t(I18N_KEYS.points.emptyTitle),
    emptyMessage: t(I18N_KEYS.points.emptyMessage),
  };
}
