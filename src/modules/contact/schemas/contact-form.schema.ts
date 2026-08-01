import { schemaBuilder } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

const keys = I18N_KEYS.contact;

/**
 * Contact request validation, bounds mirrored from the backend DTO spec
 * (`POST /contact`): email format max 254; subject trimmed 3-160; message
 * trimmed 10-4000. Messages are i18n KEYS translated by the form hook.
 */
export const contactFormSchema = schemaBuilder.object({
  email: schemaBuilder
    .string()
    .trim()
    .min(1, keys.validationEmailRequired)
    .max(254, keys.validationEmailTooLong)
    .pipe(schemaBuilder.email(keys.validationEmailInvalid)),
  subject: schemaBuilder
    .string()
    .trim()
    .min(3, keys.validationSubjectTooShort)
    .max(160, keys.validationSubjectTooLong),
  message: schemaBuilder
    .string()
    .trim()
    .min(10, keys.validationMessageTooShort)
    .max(4000, keys.validationMessageTooLong),
});
