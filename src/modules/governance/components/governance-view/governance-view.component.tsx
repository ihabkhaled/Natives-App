import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageShell, SectionPanel } from '@/shared/ui';

import { MeetingCard } from '../meeting-card';
import { TaskCard } from '../task-card';
import { GOVERNANCE_STATE_TEST_IDS } from './governance-view.constants';
import type { GovernanceViewProps } from './governance-view.types';

/**
 * The board's record: meetings soonest first, and the tasks they raised with
 * open work ahead of closed. Both lists arrive already filtered by each
 * record's visibility, so nothing here re-checks who may read what.
 */
export function GovernanceView(props: GovernanceViewProps): React.JSX.Element {
  return (
    <PageShell title={props.pageTitle} testId={TEST_IDS.governancePage}>
      <section
        data-testid={TEST_IDS.governanceView}
        aria-label={props.pageTitle}
        className="app-governance flex flex-col gap-5"
      >
        <AsyncStateView view={props} variant="list" {...GOVERNANCE_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <>
            <SectionPanel heading={props.meetingsHeading} intro={props.meetingsIntro}>
              <IonText color="medium">
                <p className="m-0 text-sm">{props.meetingCountLabel}</p>
              </IonText>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {props.meetings.map((meeting) => (
                  <li key={meeting.id}>
                    <MeetingCard view={meeting} />
                  </li>
                ))}
              </ul>
            </SectionPanel>

            <SectionPanel heading={props.tasksHeading} intro={props.tasksIntro}>
              <IonText color="medium">
                <p className="m-0 text-sm">{props.taskCountLabel}</p>
              </IonText>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {props.tasks.map((task) => (
                  <li key={task.id}>
                    <TaskCard view={task} />
                  </li>
                ))}
              </ul>
            </SectionPanel>
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
