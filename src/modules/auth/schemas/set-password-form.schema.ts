import { schemaBuilder } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

const MIN_PASSWORD_LENGTH = 12;

/**
 * Strong-password policy shared by invitation acceptance and password reset:
 * at least 12 characters with lower-case, upper-case, and a digit, plus a
 * matching confirmation. Messages are i18n KEYS translated by the form hook.
 */
export const setPasswordFormSchema = schemaBuilder
  .object({
    password: schemaBuilder
      .string()
      .min(MIN_PASSWORD_LENGTH, I18N_KEYS.auth.validationPasswordWeak)
      .regex(/[a-z]/u, I18N_KEYS.auth.validationPasswordWeak)
      .regex(/[A-Z]/u, I18N_KEYS.auth.validationPasswordWeak)
      .regex(/\d/u, I18N_KEYS.auth.validationPasswordWeak),
    confirmPassword: schemaBuilder.string().min(1, I18N_KEYS.auth.validationConfirmRequired),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: I18N_KEYS.auth.validationPasswordsMismatch,
    path: ['confirmPassword'],
  });
