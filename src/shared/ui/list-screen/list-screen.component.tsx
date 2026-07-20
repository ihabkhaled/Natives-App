import { IonNote, IonText } from '@/packages/ionic';

import { AsyncStateView } from '../async-state-view';
import { EmptyState } from '../empty-state';
import { PageShell } from '../page-shell';
import { SelectField } from '../select-field';
import type { ListScreenProps } from './list-screen.types';

/**
 * The canonical bounded-list screen: intro, client-side filters, exactly one
 * designed async state, and the list itself once there is something to show.
 */
export function ListScreen(props: ListScreenProps): React.JSX.Element {
  const isReady = props.state.view.status === 'ready';
  return (
    <PageShell title={props.title} testId={props.pageTestId}>
      <section
        data-testid={props.viewTestId}
        aria-label={props.title}
        className={`${props.className} flex flex-col gap-5`}
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        <div className="app-list-screen__filters">
          {props.filters.map((filter) => (
            <SelectField key={filter.label} {...filter} />
          ))}
          {props.filterExtra}
        </div>

        <AsyncStateView {...props.state} />

        {isReady && !props.hasMatches ? (
          <EmptyState title={props.noMatchesTitle} message={props.noMatchesMessage} />
        ) : null}

        {isReady && props.hasMatches ? (
          <>
            <IonNote>{props.countLabel}</IonNote>
            {props.children}
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
