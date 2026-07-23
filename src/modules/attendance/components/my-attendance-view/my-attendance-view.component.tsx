import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageShell } from '@/shared/ui';

import { ParticipationSummaryCard } from '../participation-summary-card';
import { SelfCheckInCard } from '../self-check-in-card';
import { SelfHistoryList } from '../self-history-list';
import { MY_ATTENDANCE_STATE_TEST_IDS } from './my-attendance-view.constants';
import type { MyAttendanceViewProps } from './my-attendance-view.types';

/**
 * Member "My attendance": check-in on top, participation and the bounded own
 * history below, and only the caller's own facts — the roster never renders
 * (or loads) here.
 */
export function MyAttendanceView(props: MyAttendanceViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.myAttendancePage}>
      <section
        data-testid={TEST_IDS.myAttendanceView}
        aria-label={props.title}
        className="app-my-attendance flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>
        <AsyncStateView view={props} variant="dashboard" {...MY_ATTENDANCE_STATE_TEST_IDS} />
        {props.status === 'ready' ? (
          <>
            <SelfCheckInCard view={props.checkIn} />
            {props.participation === null ? null : (
              <ParticipationSummaryCard view={props.participation} />
            )}
            <SelfHistoryList view={props.history} />
            <IonNote className="block text-xs">{props.privacyNotice}</IonNote>
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
