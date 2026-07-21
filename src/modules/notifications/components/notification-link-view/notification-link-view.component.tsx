import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AsyncStateView, PageShell } from '@/shared/ui';

import { LINK_STATE_TEST_IDS } from './notification-link-view.constants';
import type { NotificationLinkViewProps } from './notification-link-view.types';

/**
 * The deep-link arrival screen. It renders exactly one designed state and a
 * way back — and no field of the linked record in any of them, so a revoked
 * permission cannot leak the target through this screen.
 */
export function NotificationLinkView(props: NotificationLinkViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.notificationLinkPage}>
      <section
        data-testid={TEST_IDS.notificationLinkView}
        aria-label={props.title}
        className="app-notification-link flex flex-col gap-5"
      >
        <p className="app-pending-notice m-0" role="note">
          {props.noPreviewNotice}
        </p>

        <AsyncStateView view={props} variant="detail" {...LINK_STATE_TEST_IDS} />

        <IonNote>{props.resolvingLabel}</IonNote>

        <AppButton
          label={props.backLabel}
          tone="secondary"
          testId={TEST_IDS.notificationLinkBack}
          onClick={props.onBack}
        />
      </section>
    </PageShell>
  );
}
