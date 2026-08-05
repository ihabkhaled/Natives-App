import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { ErrorState, LoadingState, PageShell, PermissionState } from '@/shared/ui';

import { resolveAgendaGroupsScreenState } from '../../helpers/agenda-groups-screen-state.helper';
import { AgendaGroupsSummary } from '../agenda-groups-summary';
import type { PracticeAgendaGroupsViewProps } from './practice-agenda-groups-view.types';

/**
 * Split a session's roster into groups, assign members, see the resolved
 * plan, and copy an agenda from another session instead of rebuilding it.
 *
 * The screen owns only which state to show; the loaded body is
 * `AgendaGroupsSummary`. States are resolved once into a single value rather
 * than re-derived per branch, so "forbidden" and "loading" can never both
 * render.
 */
export function PracticeAgendaGroupsView(props: PracticeAgendaGroupsViewProps): React.JSX.Element {
  const state = resolveAgendaGroupsScreenState(props);
  return (
    <PageShell title={props.title} testId={TEST_IDS.practiceAgendaGroupsPage}>
      <section aria-label={props.title} className="flex flex-col gap-5">
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        {props.notice === null ? null : (
          // The live region is the wrapper, never the list it might contain,
          // so a screen reader announces the outcome without losing the
          // list's own role.
          <div data-testid={TEST_IDS.practiceAgendaGroupsNotice} role="status">
            <p className="app-pending-notice m-0">{props.notice}</p>
          </div>
        )}

        {state === 'forbidden' ? (
          <PermissionState
            title={props.errorTitle}
            testId={TEST_IDS.practiceAgendaGroupsForbidden}
          />
        ) : null}

        {state === 'loading' ? (
          <LoadingState label={props.loadingLabel} testId={TEST_IDS.practiceAgendaGroupsLoading} />
        ) : null}

        {state === 'error' ? (
          <ErrorState
            title={props.errorTitle}
            message={props.errorMessage}
            testId={TEST_IDS.practiceAgendaGroupsError}
          />
        ) : null}

        {state === 'ready' ? <AgendaGroupsSummary {...props} /> : null}
      </section>
    </PageShell>
  );
}
