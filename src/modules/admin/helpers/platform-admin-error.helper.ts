import { APP_ERROR_CODE, isAppError } from '@/shared/errors';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

/**
 * Backend message keys the super-admin writes can surface, mapped to
 * privilege-specific copy. The last-admin refusal is a deliberate safeguard
 * and is stated as one — never as a generic conflict or a retry hint.
 */
const PLATFORM_ADMIN_MESSAGE_KEY_TO_I18N: Readonly<Record<string, I18nKey>> = {
  'errors.rbac.lastSuperAdmin': I18N_KEYS.adminPlatform.lastAdminError,
  'errors.rbac.assignmentNotFound': I18N_KEYS.adminPlatform.notFoundError,
};

const PLATFORM_ADMIN_CODE_TO_I18N: Readonly<Record<string, I18nKey>> = {
  [APP_ERROR_CODE.Forbidden]: I18N_KEYS.adminPlatform.forbiddenError,
  [APP_ERROR_CODE.NotFound]: I18N_KEYS.adminPlatform.notFoundError,
  [APP_ERROR_CODE.Conflict]: I18N_KEYS.adminPlatform.targetConflictError,
  [APP_ERROR_CODE.Validation]: I18N_KEYS.adminPlatform.validationError,
};

/** Resolve the i18n key for a failed promote/revoke; message key wins. */
export function resolvePlatformAdminErrorKey(error: unknown): I18nKey {
  if (!isAppError(error)) {
    return I18N_KEYS.adminPlatform.genericError;
  }
  const byMessage =
    error.messageKey === undefined
      ? undefined
      : PLATFORM_ADMIN_MESSAGE_KEY_TO_I18N[error.messageKey];
  return (
    byMessage ?? PLATFORM_ADMIN_CODE_TO_I18N[error.code] ?? I18N_KEYS.adminPlatform.genericError
  );
}
