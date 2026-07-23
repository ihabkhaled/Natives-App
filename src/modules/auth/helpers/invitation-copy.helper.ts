import type { AppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { InvitationDetails } from '../types/auth.types';

/**
 * Team-role slugs this client ships copy for. The catalog is server-owned and
 * open, so anything else renders through the humanized-slug fallback — the
 * auth module deliberately re-declares this tiny map instead of importing the
 * members module, which would invert the module dependency direction.
 */
const TEAM_ROLE_LABEL_KEYS: Readonly<Record<string, string>> = {
  member: I18N_KEYS.members.roleMember,
  scorekeeper: I18N_KEYS.members.roleScorekeeper,
  analyst: I18N_KEYS.members.roleAnalyst,
  coach: I18N_KEYS.members.roleCoach,
  team_admin: I18N_KEYS.members.roleTeamAdmin,
};

function teamRoleLabel(slug: string, translate: AppTranslation['t']): string {
  const key = TEAM_ROLE_LABEL_KEYS[slug];
  if (key !== undefined) {
    return translate(key);
  }
  return slug
    .split('_')
    .filter((part) => part !== '')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Build localized, truthful invitation copy: the invitee is told which TEAM
 * they are joining and as WHAT ROLE before they set a password. A
 * platform-scoped invitation without a team keeps the older, team-less lines
 * rather than inventing a team name.
 */
export function buildInvitationIntro(
  invitation: InvitationDetails,
  translate: AppTranslation['t'],
): string {
  const role = teamRoleLabel(invitation.teamRole, translate);
  if (invitation.teamName !== null) {
    if (invitation.inviterName === null) {
      return translate(I18N_KEYS.auth.acceptInvitationIntroTeamRole, {
        team: invitation.teamName,
        role,
      });
    }
    return translate(I18N_KEYS.auth.acceptInvitationIntroTeamRoleWithInviter, {
      inviter: invitation.inviterName,
      team: invitation.teamName,
      role,
    });
  }
  if (invitation.inviterName === null) {
    return translate(I18N_KEYS.auth.acceptInvitationIntroFromTeam, { role });
  }
  return translate(I18N_KEYS.auth.acceptInvitationIntroWithInviter, {
    inviter: invitation.inviterName,
    role,
  });
}
