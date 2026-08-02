import { IonText } from '@/packages/ionic';
import { PageShell } from '@/shared/ui';

import type { StandingsScreenShellProps } from './standings-screen-shell.types';

/**
 * The page frame the standings and achievements screens share: a titled shell
 * around a labelled region with the screen's intro line. Extracted because the
 * two views carried a byte-identical copy of it.
 */
export function StandingsScreenShell(props: StandingsScreenShellProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={props.pageTestId}>
      <section
        data-testid={props.viewTestId}
        aria-label={props.title}
        className="app-standings flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>
        {props.children}
      </section>
    </PageShell>
  );
}
