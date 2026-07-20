import type { TranslateParams } from '@/packages/i18n';
import { type AppError } from '@/shared/errors/app.errors';
import { I18N_KEYS } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';
import type { AsyncViewCopy } from '@/shared/types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The shared loading/error/offline copy block for members async screens. */
export function buildMembersAsyncCopy(
  t: Translate,
  error: AppError | null,
  isOffline: boolean,
  onRetry: () => void,
): AsyncViewCopy {
  return {
    loadingLabel: t(I18N_KEYS.members.loadingLabel),
    errorTitle: t(I18N_KEYS.members.errorTitle),
    errorMessage: error === null ? '' : t(mapErrorCodeToI18nKey(error.code)),
    retryLabel: t(I18N_KEYS.members.retry),
    onRetry,
    offlineTitle: t(I18N_KEYS.members.offlineTitle),
    offlineMessage: t(I18N_KEYS.members.offlineMessage),
    offlineNoticeLabel: t(I18N_KEYS.members.offlineMessage),
    isOffline,
  };
}
