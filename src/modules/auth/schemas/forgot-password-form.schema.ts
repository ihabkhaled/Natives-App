import { schemaBuilder } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

/**
 * Forgot-password request validation. A single email field; the server never
 * confirms whether the account exists (enumeration-safe). Messages are i18n
 * KEYS translated by the form hook.
 */
export const forgotPasswordFormSchema = schemaBuilder.object({
  email: schemaBuilder
    .string()
    .min(1, I18N_KEYS.auth.validationEmailRequired)
    .pipe(schemaBuilder.email(I18N_KEYS.auth.validationEmailInvalid)),
});
