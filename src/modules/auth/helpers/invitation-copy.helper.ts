import type { AppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import { INVITATION_ROLE, type InvitationDetails } from '../types/auth.types';

function roleLabel(invitation: InvitationDetails, translate: AppTranslation['t']): string {
  const key =
    invitation.role === INVITATION_ROLE.Admin
      ? I18N_KEYS.auth.invitationRoleAdmin
      : I18N_KEYS.auth.invitationRoleUser;
  return translate(key);
}

/** Build localized, truthful invitation copy without inventing team context. */
export function buildInvitationIntro(
  invitation: InvitationDetails,
  translate: AppTranslation['t'],
): string {
  const role = roleLabel(invitation, translate);
  if (invitation.inviterName === null) {
    return translate(I18N_KEYS.auth.acceptInvitationIntroFromTeam, { role });
  }
  return translate(I18N_KEYS.auth.acceptInvitationIntroWithInviter, {
    inviter: invitation.inviterName,
    role,
  });
}
