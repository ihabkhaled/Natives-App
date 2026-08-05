import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { ErrorState, LoadingState, PageShell, PermissionState } from '@/shared/ui';

import { resolveRsvpDetailScreenState } from '../../helpers/rsvp-detail-screen-state.helper';
import { RsvpHistoryPanel } from '../rsvp-history-panel';
import { RsvpOverridePanel } from '../rsvp-override-panel';
import { RsvpRoster } from '../rsvp-roster';
import { RsvpSummary } from '../rsvp-summary';
import type { RsvpDetailViewProps } from './rsvp-detail-view.types';

/**
 * Who is coming to this session, the summary counts, and the one member a
 * coach opened an override or a history panel for.
 *
 * The screen owns only which state to show; the loaded body composes three
 * focused children. States are resolved once into a single value rather than
 * re-derived per branch, so "forbidden" and "loading" can never both render.
 */
export function RsvpDetailView(props: RsvpDetailViewProps): React.JSX.Element {
  const state = resolveRsvpDetailScreenState(props);
  return (
    <PageShell title={props.title} testId={TEST_IDS.practiceRsvpDetailPage}>
      <section aria-label={props.title} className="flex flex-col gap-5">
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        {state === 'forbidden' ? (
          <PermissionState title={props.errorTitle} testId={TEST_IDS.practiceRsvpDetailForbidden} />
        ) : null}

        {state === 'loading' ? (
          <LoadingState label={props.loadingLabel} testId={TEST_IDS.practiceRsvpDetailLoading} />
        ) : null}

        {state === 'error' ? (
          <ErrorState
            title={props.errorTitle}
            message={props.errorMessage}
            testId={TEST_IDS.practiceRsvpDetailError}
          />
        ) : null}

        {state === 'ready' ? (
          <>
            {props.summary === null ? null : <RsvpSummary {...props.summary} />}
            <RsvpRoster {...props} />
            {props.panel.kind === 'override' ? <RsvpOverridePanel {...props.panel.panel} /> : null}
            {props.panel.kind === 'history' ? <RsvpHistoryPanel {...props.panel.panel} /> : null}
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
