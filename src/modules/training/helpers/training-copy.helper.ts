import type { TranslateParams } from '@/packages/i18n';
import type { AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';

import type { TrainingScreenCopy } from '../types/training-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

export interface TrainingCopyInput {
  readonly error: AppError | null;
  readonly isOffline: boolean;
  readonly onRetry: () => void;
  readonly emptyTitleKey: string;
  readonly emptyMessageKey: string;
}

/**
 * The async + guard + empty copy block every training screen shares. One
 * function rather than three so a screen hook stays a thin composition and the
 * five designed states always carry translated copy.
 */
export function buildTrainingScreenCopy(
  t: Translate,
  input: TrainingCopyInput,
): TrainingScreenCopy {
  const errorMessage =
    input.error === null
      ? t(I18N_KEYS.training.errorMessage)
      : t(mapErrorCodeToI18nKey(input.error.code));
  return {
    loadingLabel: t(I18N_KEYS.training.loadingLabel),
    errorTitle: t(I18N_KEYS.training.errorTitle),
    errorMessage,
    retryLabel: t(I18N_KEYS.training.retry),
    onRetry: input.onRetry,
    offlineTitle: t(I18N_KEYS.training.offlineTitle),
    offlineMessage: t(I18N_KEYS.training.offlineMessage),
    offlineNoticeLabel: t(I18N_KEYS.training.offlineMessage),
    isOffline: input.isOffline,
    forbiddenTitle: t(I18N_KEYS.training.forbiddenTitle),
    forbiddenMessage: t(I18N_KEYS.training.forbiddenMessage),
    emptyTitle: t(input.emptyTitleKey),
    emptyMessage: t(input.emptyMessageKey),
  };
}
