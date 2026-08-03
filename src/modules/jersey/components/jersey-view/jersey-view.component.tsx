import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageShell, SectionPanel } from '@/shared/ui';

import { JerseyOrderRow } from '../jersey-order-row';
import { JERSEY_STATE_TEST_IDS } from './jersey-view.constants';
import type { JerseyViewProps } from './jersey-view.types';

/**
 * The team's supplier orders, newest first. Everything on this screen is a
 * read; nothing here places, changes or cancels an order.
 *
 * The failure line is a live region rather than the panel's own static notice:
 * it appears in response to something an operator just did, so it has to be
 * announced rather than merely displayed.
 */
export function JerseyView(props: JerseyViewProps): React.JSX.Element {
  return (
    <PageShell title={props.pageTitle} testId={TEST_IDS.jerseyPage}>
      <SectionPanel heading={props.listHeading} intro={props.subtitle} testId={TEST_IDS.jerseyView}>
        <div className="app-jersey flex flex-col gap-4">
          {props.notice === null ? null : (
            <p className="app-pending-notice m-0" role="status">
              {props.notice}
            </p>
          )}

          <AsyncStateView view={props} variant="list" {...JERSEY_STATE_TEST_IDS} />

          {props.status === 'ready' ? (
            <>
              <IonText color="medium">
                <p className="m-0 text-sm">
                  {props.countLabel} · {props.listIntro}
                </p>
              </IonText>
              <ul className="app-jersey__list m-0 flex list-none flex-col gap-3 p-0">
                {props.rows.map((row) => (
                  <li key={row.id}>
                    <JerseyOrderRow
                      view={row}
                      detail={props.detail?.orderId === row.id ? props.detail : null}
                      onToggle={props.onToggleOrder}
                    />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </SectionPanel>
    </PageShell>
  );
}
