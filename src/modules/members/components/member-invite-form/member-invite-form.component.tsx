import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import { InviteSentPanel } from '../invite-sent-panel';
import { MemberInviteFields } from '../member-invite-fields';
import { resolveInvitePanel } from './member-invite-form.helper';
import type { MemberInviteFormProps } from './member-invite-form.types';

/**
 * The directory's single "invite a real person" entry point: the trigger, then
 * either the form (account invitation + roster profile in one submission) or
 * the sent panel carrying the one-time accept link.
 */
export function MemberInviteForm(props: MemberInviteFormProps): React.JSX.Element | null {
  const { invite } = props;
  const panel = resolveInvitePanel(invite);
  return invite.canInvite ? (
    <div className="app-member-invite flex flex-col gap-3">
      <AppButton
        testId={TEST_IDS.membersInviteButton}
        label={invite.openLabel}
        tone="primary"
        onClick={invite.onOpen}
      />
      {panel === 'sent' && invite.sent !== null ? <InviteSentPanel view={invite.sent} /> : null}
      {panel === 'form' ? <MemberInviteFields invite={invite} /> : null}
    </div>
  ) : null;
}
