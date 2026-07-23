import { schemaBuilder } from '@/packages/schema';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

const emailSchema = schemaBuilder.email();

/** The reason the invite form cannot be submitted yet, or null when it can. */
export interface InviteFormErrors {
  readonly email: I18nKey | null;
  readonly fullName: I18nKey | null;
}

/**
 * Validate the invite form. Both fields are required because both records are:
 * the email creates the account invitation, the full name creates the roster
 * entry that invitation will eventually attach to.
 */
export function validateInviteForm(email: string, fullName: string): InviteFormErrors {
  const trimmedEmail = email.trim();
  return {
    email:
      trimmedEmail === ''
        ? I18N_KEYS.members.inviteEmailRequired
        : emailSchema.safeParse(trimmedEmail).success
          ? null
          : I18N_KEYS.members.inviteEmailInvalid,
    fullName: fullName.trim() === '' ? I18N_KEYS.members.inviteFullNameRequired : null,
  };
}

/** True only when every field the server needs is present and well-formed. */
export function isInviteFormValid(errors: InviteFormErrors): boolean {
  return errors.email === null && errors.fullName === null;
}

/** A field error is only shown after the first submit attempt. */
export function resolveSubmittedError(
  t: (key: string) => string,
  isSubmitted: boolean,
  key: I18nKey | null,
): string | null {
  return isSubmitted && key !== null ? t(key) : null;
}
