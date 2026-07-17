import { schemaBuilder } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

/** Demo form contract; error messages are i18n keys (see rules/16). */
export const workbenchFormSchema = schemaBuilder.object({
  name: schemaBuilder.string().min(1, I18N_KEYS.workbench.formValidationNameRequired),
  email: schemaBuilder
    .string()
    .min(1, I18N_KEYS.workbench.formValidationEmailInvalid)
    .pipe(schemaBuilder.email(I18N_KEYS.workbench.formValidationEmailInvalid)),
});
