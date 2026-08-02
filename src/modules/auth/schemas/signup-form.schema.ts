import { schemaBuilder } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

/**
 * Client mirror of the backend `SignupRequestDto` (contract 1.7.0):
 * `email` (<= 320), `displayName` (1..120), `password` (12..72). The length
 * ceilings are the server's, restated here so an over-long value fails at the
 * field instead of returning an opaque 400. The password rules match the
 * strong-password policy the reset and invitation flows already enforce.
 *
 * Messages are i18n KEYS; the owning form hook translates them.
 */
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 72;
const MAX_DISPLAY_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 320;

export const signupFormSchema = schemaBuilder.object({
  displayName: schemaBuilder
    .string()
    .trim()
    .min(1, I18N_KEYS.signup.validationNameRequired)
    .max(MAX_DISPLAY_NAME_LENGTH, I18N_KEYS.signup.validationNameTooLong),
  email: schemaBuilder
    .string()
    .trim()
    .min(1, I18N_KEYS.auth.validationEmailRequired)
    .max(MAX_EMAIL_LENGTH, I18N_KEYS.signup.validationEmailTooLong)
    .pipe(schemaBuilder.email(I18N_KEYS.auth.validationEmailInvalid)),
  password: schemaBuilder
    .string()
    .min(MIN_PASSWORD_LENGTH, I18N_KEYS.auth.validationPasswordWeak)
    .max(MAX_PASSWORD_LENGTH, I18N_KEYS.signup.validationPasswordTooLong)
    .regex(/[a-z]/u, I18N_KEYS.auth.validationPasswordWeak)
    .regex(/[A-Z]/u, I18N_KEYS.auth.validationPasswordWeak)
    .regex(/\d/u, I18N_KEYS.auth.validationPasswordWeak),
});
