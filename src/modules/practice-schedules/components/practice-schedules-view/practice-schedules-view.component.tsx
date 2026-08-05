import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { ErrorState, LoadingState, PageShell, PermissionState } from '@/shared/ui';

import { resolveScheduleScreenState } from '../../helpers/schedule-screen-state.helper';
import { ScheduleListBody } from '../schedule-list-body';
import type { PracticeSchedulesViewProps } from './practice-schedules-view.types';

/**
 * The team's recurring-pattern catalogue.
 *
 * The screen owns only which state to show; the loaded body is
 * `ScheduleListBody`. States are resolved once into a single value rather
 * than re-derived per branch, so "forbidden" and "loading" can never both
 * render.
 */
export function PracticeSchedulesView(props: PracticeSchedulesViewProps): React.JSX.Element {
  const state = resolveScheduleScreenState(props);
  return (
    <PageShell title={props.title} testId={TEST_IDS.practiceSchedulesPage}>
      <section aria-label={props.title} className="flex flex-col gap-5">
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        {state === 'forbidden' ? (
          <PermissionState title={props.errorTitle} testId={TEST_IDS.practiceSchedulesForbidden} />
        ) : null}

        {state === 'loading' ? (
          <LoadingState label={props.loadingLabel} testId={TEST_IDS.practiceSchedulesLoading} />
        ) : null}

        {state === 'error' ? (
          <ErrorState
            title={props.errorTitle}
            message={props.errorMessage}
            testId={TEST_IDS.practiceSchedulesError}
          />
        ) : null}

        {state === 'ready' ? <ScheduleListBody {...props} /> : null}
      </section>
    </PageShell>
  );
}
