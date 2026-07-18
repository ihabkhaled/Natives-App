import { APP_ERROR_CODE, type AppErrorCode } from '@/shared/errors';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

const ERROR_CODE_TO_I18N_KEY: Record<AppErrorCode, I18nKey> = {
  [APP_ERROR_CODE.NetworkOffline]: I18N_KEYS.errors.network,
  [APP_ERROR_CODE.Timeout]: I18N_KEYS.errors.timeout,
  [APP_ERROR_CODE.Unauthorized]: I18N_KEYS.errors.unauthorized,
  [APP_ERROR_CODE.Forbidden]: I18N_KEYS.errors.forbidden,
  [APP_ERROR_CODE.NotFound]: I18N_KEYS.errors.notFound,
  [APP_ERROR_CODE.RateLimited]: I18N_KEYS.errors.rateLimited,
  [APP_ERROR_CODE.Validation]: I18N_KEYS.errors.validation,
  [APP_ERROR_CODE.Server]: I18N_KEYS.errors.server,
  [APP_ERROR_CODE.Unexpected]: I18N_KEYS.errors.unexpected,
  [APP_ERROR_CODE.InvalidCredentials]: I18N_KEYS.errors.invalidCredentials,
  [APP_ERROR_CODE.SessionExpired]: I18N_KEYS.errors.sessionExpired,
  [APP_ERROR_CODE.DeepLinkRejected]: I18N_KEYS.errors.deepLinkRejected,
  [APP_ERROR_CODE.LinkInvalidOrExpired]: I18N_KEYS.errors.linkInvalidOrExpired,
};

export function mapErrorCodeToI18nKey(code: AppErrorCode): I18nKey {
  return ERROR_CODE_TO_I18N_KEY[code];
}
