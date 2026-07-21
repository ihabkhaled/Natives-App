import type { InviteFormView } from '../../types/members-view.types';

/** Which panel the invite block is showing: nothing, the form, or the receipt. */
export type InvitePanel = 'closed' | 'form' | 'sent';

/**
 * The invite block has exactly three states, and deciding between them in the
 * component pushed it over the complexity budget. Closed wins first: a
 * dismissed form must not leave a stale receipt on screen.
 */
export function resolveInvitePanel(invite: InviteFormView): InvitePanel {
  if (!invite.isOpen) {
    return 'closed';
  }
  return invite.sent === null ? 'form' : 'sent';
}
