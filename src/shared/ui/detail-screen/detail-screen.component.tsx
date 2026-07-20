import { AsyncStateView } from '../async-state-view';
import { AppButton } from '../button';
import { PageShell } from '../page-shell';
import type { DetailScreenProps } from './detail-screen.types';

/**
 * The canonical routed detail screen: a back affordance, exactly one designed
 * async state, an optional notice, and the record's own sections once ready.
 */
export function DetailScreen(props: DetailScreenProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={props.pageTestId}>
      <section
        data-testid={props.viewTestId}
        aria-label={props.heading}
        className={`${props.className} flex flex-col gap-5`}
      >
        <AppButton
          label={props.backLabel}
          tone="ghost"
          testId={props.backTestId}
          onClick={props.onBack}
        />

        {props.notice === null ? null : (
          <p className="app-pending-notice m-0" role="note">
            {props.notice}
          </p>
        )}

        <AsyncStateView {...props.state} />

        {props.state.view.status === 'ready' ? props.children : null}
      </section>
    </PageShell>
  );
}
