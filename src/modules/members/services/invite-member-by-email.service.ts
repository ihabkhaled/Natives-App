import { getApplicationOrigin } from '@/platform';

import { requestCreateInvitation, requestInviteMember } from '../gateways/members.gateway';
import { buildInvitationAcceptUrl } from '../helpers/invitation-link.helper';
import { runMembersRequest } from '../helpers/to-members-error.helper';
import type {
  CreateInvitationInput,
  InvitationDelivery,
  InviteMemberInput,
} from '../types/members.types';

export interface InvitePersonInput extends CreateInvitationInput {
  readonly profile: InviteMemberInput;
}

/**
 * Use case: invite a real person into the team, with the team role acceptance
 * will grant.
 *
 * Two records have to exist for that to be true: a team-scoped *account*
 * invitation at the identity layer (email + ceiling-validated team role,
 * delivered through the EmailSenderPort) and a *membership* record in the
 * team's directory (the roster profile). Creating only the second — which is
 * what the directory's original "Invite member" button did — produces a row
 * nobody can ever sign in as.
 *
 * Order matters. The invitation is created first because it is the step that
 * can legitimately be refused (a duplicate email, a role above the inviter's
 * ceiling): failing there leaves no orphan directory row behind. The
 * membership record follows, and the caller gets back the one-time accept
 * link so an administrator can deliver it by hand while the console email
 * adapter is the one configured.
 */
export function invitePersonByEmail(
  teamId: string,
  input: InvitePersonInput,
): Promise<InvitationDelivery> {
  return runMembersRequest(async () => {
    const invitation = await requestCreateInvitation(teamId, {
      email: input.email,
      teamRole: input.teamRole,
    });
    await requestInviteMember(teamId, input.profile);
    return {
      id: invitation.id,
      email: invitation.email,
      teamRole: invitation.teamRole,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      acceptUrl: buildInvitationAcceptUrl(getApplicationOrigin(), invitation.token),
    };
  });
}
