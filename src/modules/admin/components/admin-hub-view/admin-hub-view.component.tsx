import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AsyncStateView } from '@/shared/ui';

import { ADMIN_STATE_TEST_IDS } from './admin-hub-view.constants';
import type { AdminHubViewProps } from './admin-hub-view.types';

/** The admin hub: one card per surface the principal may actually open. */
export function AdminHubView(props: AdminHubViewProps): React.JSX.Element {
  return (
    <section
      data-testid={TEST_IDS.adminHubView}
      aria-label={props.title}
      className="app-admin-hub flex flex-col gap-5"
    >
      <header className="app-screen-intro">
        <IonText color="medium">
          <p className="m-0 text-sm">{props.subtitle}</p>
        </IonText>
      </header>

      <AsyncStateView view={props} variant="list" {...ADMIN_STATE_TEST_IDS} />

      {props.status === 'ready' ? (
        <ul className="app-admin-hub__list">
          {props.cards.map((card) => (
            <li
              key={card.key}
              data-testid={TEST_IDS.adminHubCard}
              className="app-surface-card app-admin-hub__card"
            >
              <div className="app-admin-hub__card-main">
                <IonText>
                  <h2 className="app-admin-hub__card-title m-0">{card.title}</h2>
                </IonText>
                <IonNote>{card.note}</IonNote>
              </div>
              <AppButton label={card.openLabel} tone="secondary" onClick={card.onOpen} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
