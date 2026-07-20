import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageShell } from '@/shared/ui';

import { PointsBadgeList } from '../points-badge-list';
import { PointsCategoryChart } from '../points-category-chart';
import { PointsLedgerList } from '../points-ledger-list';
import { POINTS_HISTORY_STATE_TEST_IDS } from './points-history-view.constants';
import type { PointsHistoryScreenProps } from './points-history-view.types';

/** Personal points: the server total, the append-only ledger, and badges. */
export function PointsHistoryScreen(props: PointsHistoryScreenProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.pointsHistoryPage}>
      <section
        data-testid={TEST_IDS.pointsHistoryView}
        aria-label={props.title}
        className="app-points-history flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        <AsyncStateView view={props} variant="dashboard" {...POINTS_HISTORY_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <>
            <div data-testid={TEST_IDS.pointsTotal} className="app-surface-card app-points-total">
              <span className="app-eyebrow">{props.totalHeading}</span>
              <strong className="app-points-total__value">{props.totalText}</strong>
            </div>

            <PointsCategoryChart view={props.chart} />

            <section aria-label={props.ledgerHeading} className="app-points-history__ledger">
              <span className="app-eyebrow">{props.ledgerHeading}</span>
              <IonNote>{props.ledgerIntro}</IonNote>
              <IonNote>{props.appendOnlyNotice}</IonNote>
              {props.hasEntries ? (
                <PointsLedgerList entries={props.entries} caption={props.ledgerHeading} />
              ) : (
                <IonNote>{props.ledgerEmptyLabel}</IonNote>
              )}
            </section>

            <PointsBadgeList
              badges={props.badges}
              emptyLabel={props.badgesEmptyLabel}
              heading={props.badgesHeading}
              intro={props.badgesIntro}
              candidateHeading={props.candidateHeading}
              candidateIntro={props.candidateIntro}
              candidates={props.candidates}
            />
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
