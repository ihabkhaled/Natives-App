import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import type { InvitationDelivery } from '../types/members.types';
import type { InviteSentView } from '../types/members-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The side effects the receipt panel triggers, injected rather than captured. */
export interface InviteSentActions {
  readonly onCopy: () => void;
  readonly onDone: () => void;
  readonly formatExpiry: (iso: string) => string;
}

/**
 * The "invitation sent" receipt. It names the address the mail went to and
 * carries the one-time accept link, because in a console-email deployment the
 * link is the only delivery that actually happened.
 */
export function buildInviteSentView(
  t: Translate,
  delivery: InvitationDelivery,
  actions: InviteSentActions,
): InviteSentView {
  return {
    title: t(I18N_KEYS.members.inviteSentTitle),
    message: t(I18N_KEYS.members.inviteSentMessage, { email: delivery.email }),
    linkLabel: t(I18N_KEYS.members.inviteLinkLabel),
    linkHint: t(I18N_KEYS.members.inviteLinkHint),
    acceptUrl: delivery.acceptUrl,
    copyLabel: t(I18N_KEYS.members.inviteCopyLink),
    onCopy: actions.onCopy,
    expiresLabel: t(I18N_KEYS.members.inviteExpiresLabel),
    expiresValue: actions.formatExpiry(delivery.expiresAt),
    doneLabel: t(I18N_KEYS.members.inviteDone),
    onDone: actions.onDone,
  };
}
