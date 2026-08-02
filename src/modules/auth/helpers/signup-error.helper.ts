import { APP_ERROR_CODE, type AppErrorCode } from '@/shared/errors';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';
import { mapErrorCodeToI18nKey } from '@/shared/mappers';

/**
 * Signup-specific failure copy. `POST /auth/signup` answers 409 when the email
 * already belongs to an account — including one that is itself still waiting
 * for approval. The generic conflict message ("that action clashed with
 * something else") tells the user nothing actionable, so this flow words that
 * one case itself and delegates every other code to the shared catalog.
 *
 * The endpoint is deliberately not enumeration-safe on the backend, so no
 * information is leaked here that the API does not already disclose.
 */
export function mapSignupErrorToI18nKey(code: AppErrorCode): I18nKey {
  return code === APP_ERROR_CODE.Conflict
    ? I18N_KEYS.signup.emailTaken
    : mapErrorCodeToI18nKey(code);
}
