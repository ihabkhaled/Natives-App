import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageShell } from '@/shared/ui';

import { ReportJobList } from '../report-job-list';
import { ReportRequestPanel } from '../report-request-panel';
import { REPORTS_STATE_TEST_IDS } from './reports-view.constants';
import type { ReportsScreenProps } from './reports-view.types';

/**
 * The reports center: request panel beside the job list on desktop, stacked
 * on mobile. Jobs always end in a terminal state and the poll degrades — an
 * endless spinner is impossible by construction.
 */
export function ReportsScreen(props: ReportsScreenProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.reportsPage}>
      <section
        data-testid={TEST_IDS.reportsView}
        aria-label={props.title}
        className="app-reports flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        {props.banner === null ? null : (
          <p className="app-pending-notice m-0" role="status">
            {props.banner}
          </p>
        )}

        <div className="app-reports__layout">
          {props.requestPanel === null ? null : <ReportRequestPanel view={props.requestPanel} />}
          <div className="app-reports__main">
            <AsyncStateView view={props} variant="list" {...REPORTS_STATE_TEST_IDS} />
            {props.status === 'ready' ? <ReportJobList view={props} /> : null}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
