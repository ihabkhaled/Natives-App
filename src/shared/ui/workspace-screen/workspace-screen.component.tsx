import { IonText } from '@/packages/ionic';

import { AsyncStateView } from '../async-state-view';
import { PageShell } from '../page-shell';
import type { WorkspaceScreenProps } from './workspace-screen.types';

/**
 * The canonical panelled workspace screen: intro, an optional advisory
 * notice, an optional toolbar, exactly one designed async state, and the
 * screen's own sections once ready. Configuration, governance, and
 * operations screens all render through it so they share one rhythm.
 */
export function WorkspaceScreen(props: WorkspaceScreenProps): React.JSX.Element {
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

        {props.notice === undefined || props.notice === null ? null : (
          <p className="app-pending-notice m-0" role="note">
            {props.notice}
          </p>
        )}

        {props.toolbar}

        <AsyncStateView {...props.state} />

        {props.state.view.status === 'ready' ? props.children : null}
      </section>
    </PageShell>
  );
}
