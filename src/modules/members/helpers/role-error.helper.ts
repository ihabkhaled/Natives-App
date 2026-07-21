import { isAppError } from '@/shared/errors';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

/**
 * Backend error message keys the role-assignment write can surface, mapped to
 * the specific, actionable copy the panel shows. Threading the backend
 * `messageKey` through the HTTP/AppError pipeline is what lets the UI state the
 * REAL reason a role change was refused instead of a generic retry message.
 */
const ROLE_ERROR_MESSAGE_KEY_TO_I18N: Readonly<Record<string, I18nKey>> = {
  'errors.members.accountRequired': I18N_KEYS.members.roleErrorAccountRequired,
  'errors.rbac.escalationDenied': I18N_KEYS.members.roleErrorForbidden,
  'errors.auth.permissionDenied': I18N_KEYS.members.roleErrorForbidden,
  'errors.rbac.roleNotFound': I18N_KEYS.members.roleErrorRoleNotFound,
};

/**
 * Resolve the i18n key for a failed role-assignment save. A known backend
 * message key yields its specific explanation; anything else falls back to the
 * generic retry message.
 */
export function resolveRoleErrorKey(error: unknown): I18nKey {
  if (isAppError(error) && error.messageKey !== undefined) {
    const mapped = ROLE_ERROR_MESSAGE_KEY_TO_I18N[error.messageKey];
    if (mapped !== undefined) {
      return mapped;
    }
  }
  return I18N_KEYS.members.roleErrorToast;
}
