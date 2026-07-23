import { APP_ICONS } from '@/packages/icons';
import { IonIcon, IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import type { InviteSentPanelProps } from './invite-sent-panel.types';

/**
 * What actually happened, stated plainly: the address the invitation went to,
 * when it expires, and the one-time accept link.
 *
 * The link is not decoration. In dev the EmailSenderPort is a console adapter,
 * so nothing lands in an inbox — the administrator has to hand the link over.
 * It is rendered as selectable text as well as a copy button, so a browser that
 * refuses clipboard access still leaves the value recoverable.
 */
export function InviteSentPanel(props: InviteSentPanelProps): React.JSX.Element {
  const { view } = props;
  return (
    <section
      data-testid={TEST_IDS.memberInviteSent}
      role="status"
      aria-label={view.title}
      className="app-invite-sent"
    >
      <header className="app-invite-sent__head">
        <IonIcon icon={APP_ICONS.checkmark} aria-hidden="true" className="app-invite-sent__icon" />
        <IonText>
          <h3 className="app-invite-sent__title m-0">{view.title}</h3>
        </IonText>
      </header>
      <p className="app-invite-sent__message m-0">{view.message}</p>

      <div className="app-invite-sent__link-block">
        <span className="app-eyebrow">{view.linkLabel}</span>
        <code data-testid={TEST_IDS.memberInviteLink} className="app-invite-sent__link">
          {view.acceptUrl}
        </code>
        <IonNote className="app-invite-sent__hint">{view.linkHint}</IonNote>
      </div>

      <dl className="app-invite-sent__facts">
        <dt>{view.teamLabel}</dt>
        <dd data-testid={TEST_IDS.memberInviteSentTeam}>{view.teamValue}</dd>
        <dt>{view.roleLabel}</dt>
        <dd data-testid={TEST_IDS.memberInviteSentRole}>{view.roleValue}</dd>
        <dt>{view.expiresLabel}</dt>
        <dd>{view.expiresValue}</dd>
      </dl>

      <div className="app-invite-sent__actions">
        <AppButton
          testId={TEST_IDS.memberInviteCopyLink}
          label={view.copyLabel}
          tone="secondary"
          onClick={view.onCopy}
        />
        <AppButton
          testId={TEST_IDS.memberInviteDone}
          label={view.doneLabel}
          tone="primary"
          onClick={view.onDone}
        />
      </div>
    </section>
  );
}
