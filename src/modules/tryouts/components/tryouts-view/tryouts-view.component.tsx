import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageShell } from '@/shared/ui';

import { TryoutCard } from '../tryout-card';
import { TRYOUTS_STATE_TEST_IDS } from './tryouts-view.constants';
import type { TryoutsViewProps } from './tryouts-view.types';

/** Staff tryout event list, with the backend-pending notice kept visible. */
export function TryoutsView(props: TryoutsViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.tryoutsPage}>
      <section
        data-testid={TEST_IDS.tryoutsView}
        aria-label={props.title}
        className="app-tryouts flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        <p
          data-testid={TEST_IDS.tryoutBackendPending}
          className="app-pending-notice m-0"
          role="note"
        >
          {props.backendPendingNotice}
        </p>

        <AsyncStateView view={props} variant="list" {...TRYOUTS_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <ul data-testid={TEST_IDS.tryoutsList} className="app-tryouts__list">
            {props.items.map((item) => (
              <TryoutCard key={item.id} item={item} onOpen={props.onOpen} />
            ))}
          </ul>
        ) : null}
      </section>
    </PageShell>
  );
}
