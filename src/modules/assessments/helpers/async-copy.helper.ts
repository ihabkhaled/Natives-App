import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';
import type { AppError } from '@/shared/errors/app.errors';
import type { AsyncViewCopy } from '@/shared/types';

type Translate = (key: string, params?: TranslateParams) => string;

/**
 * The loading / error / offline block every assessment screen shares. Defined
 * once so each screen hook stays a thin composition of its own concerns.
 */
export function buildAssessmentsAsyncCopy(
  t: Translate,
  error: AppError | null,
  isOffline: boolean,
  onRetry: () => void,
): AsyncViewCopy {
  return {
    loadingLabel: t(I18N_KEYS.assessments.loadingLabel),
    errorTitle: t(I18N_KEYS.assessments.errorTitle),
    errorMessage:
      error === null ? t(I18N_KEYS.assessments.errorMessage) : t(mapErrorCodeToI18nKey(error.code)),
    retryLabel: t(I18N_KEYS.assessments.retry),
    onRetry,
    offlineTitle: t(I18N_KEYS.assessments.offlineTitle),
    offlineMessage: t(I18N_KEYS.assessments.offlineMessage),
    offlineNoticeLabel: t(I18N_KEYS.assessments.offlineMessage),
    isOffline,
  };
}

/** The permission + not-found copy the assessment screens share. */
export function buildAssessmentsGuardCopy(t: Translate): {
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
} {
  return {
    forbiddenTitle: t(I18N_KEYS.assessments.forbiddenTitle),
    forbiddenMessage: t(I18N_KEYS.assessments.forbiddenMessage),
  };
}
