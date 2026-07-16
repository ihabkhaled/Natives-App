import { schemaBuilder } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

const MIN_PASSWORD_LENGTH = 8;

/**
 * Client-side login validation. Error messages are i18n KEYS; the form
 * hook translates them before they reach the UI.
 */
export const loginFormSchema = schemaBuilder.object({
  email: schemaBuilder
    .string()
    .min(1, I18N_KEYS.auth.validationEmailRequired)
    .pipe(schemaBuilder.email(I18N_KEYS.auth.validationEmailInvalid)),
  password: schemaBuilder
    .string()
    .min(1, I18N_KEYS.auth.validationPasswordRequired)
    .min(MIN_PASSWORD_LENGTH, I18N_KEYS.auth.validationPasswordMin),
});
