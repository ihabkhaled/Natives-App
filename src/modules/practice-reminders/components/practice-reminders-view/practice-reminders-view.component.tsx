import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { ErrorState, LoadingState, PageShell, PermissionState } from '@/shared/ui';

import { resolveReminderScreenState } from '../../helpers/reminder-screen-state.helper';
import { ReminderSummary } from '../reminder-summary';
import type { PracticeRemindersViewProps } from './practice-reminders-view.types';

/**
 * Who still has to hear about this session, and what sending would do.
 *
 * The screen owns only which state to show; the loaded body is
 * `ReminderSummary`. States are resolved once into a single value rather than
 * re-derived per branch, so "forbidden" and "loading" can never both render.
 */
export function PracticeRemindersView(props: PracticeRemindersViewProps): React.JSX.Element {
  const state = resolveReminderScreenState(props);
  return (
    <PageShell title={props.title} testId={TEST_IDS.practiceRemindersPage}>
      <section aria-label={props.title} className="flex flex-col gap-5">
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        {state === 'forbidden' ? (
          <PermissionState title={props.errorTitle} testId={TEST_IDS.practiceRemindersForbidden} />
        ) : null}

        {state === 'loading' ? (
          <LoadingState label={props.loadingLabel} testId={TEST_IDS.practiceRemindersLoading} />
        ) : null}

        {state === 'error' ? (
          <ErrorState
            title={props.errorTitle}
            message={props.errorMessage}
            testId={TEST_IDS.practiceRemindersError}
          />
        ) : null}

        {state === 'ready' ? <ReminderSummary {...props} /> : null}
      </section>
    </PageShell>
  );
}
