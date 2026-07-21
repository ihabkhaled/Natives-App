import { schemaBuilder } from '@/packages/schema';
import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

import {
  INVITATION_ROLE,
  INVITATION_ROLE_LABEL_KEYS,
  INVITATION_ROLES,
  type InvitationRole,
} from '../constants/members.constants';

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

/** Narrow a select value back to a role the identity endpoint accepts. */
export function toInvitationRole(value: string): InvitationRole {
  return INVITATION_ROLES.find((role) => role === value) ?? INVITATION_ROLE.user;
}

/** The access-level choices, translated through the client's own catalog. */
export function buildInvitationRoleOptions(
  t: (key: string) => string,
): readonly { value: string; label: string }[] {
  return INVITATION_ROLES.map((role) => ({
    value: role,
    label: t(INVITATION_ROLE_LABEL_KEYS[role]),
  }));
}
