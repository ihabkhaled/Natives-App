import { APP_ERROR_CODE, isAppError } from '@/shared/errors';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

/**
 * Backend message keys the invitation write can surface, mapped to the copy the
 * form shows. Threading the backend `messageKey` through the AppError pipeline
 * is what lets the form state the real reason instead of a generic retry line.
 */
const INVITATION_MESSAGE_KEY_TO_I18N: Readonly<Record<string, I18nKey>> = {
  'errors.identity.invitationAlreadyExists': I18N_KEYS.members.inviteDuplicateError,
  'errors.identity.emailAlreadyRegistered': I18N_KEYS.members.inviteDuplicateError,
  'errors.identity.invitationExpired': I18N_KEYS.members.inviteExpiredError,
  'errors.identity.invitationInvalid': I18N_KEYS.members.inviteInvalidError,
};

/** Error classes that are about the address, not about the server being sad. */
const INVITATION_CODE_TO_I18N: Readonly<Record<string, I18nKey>> = {
  [APP_ERROR_CODE.Conflict]: I18N_KEYS.members.inviteDuplicateError,
  [APP_ERROR_CODE.Validation]: I18N_KEYS.members.inviteInvalidError,
};

/**
 * Resolve the i18n key for a failed invitation. A known backend message key
 * wins; otherwise the error class decides (duplicate vs. malformed); anything
 * else falls back to the generic "could not send" line. Raw backend text never
 * reaches the screen.
 */
export function resolveInvitationErrorKey(error: unknown): I18nKey {
  if (!isAppError(error)) {
    return I18N_KEYS.members.inviteFailedError;
  }
  const byMessage =
    error.messageKey === undefined ? undefined : INVITATION_MESSAGE_KEY_TO_I18N[error.messageKey];
  return byMessage ?? INVITATION_CODE_TO_I18N[error.code] ?? I18N_KEYS.members.inviteFailedError;
}
