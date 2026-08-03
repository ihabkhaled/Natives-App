import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageShell } from '@/shared/ui';

import { CandidateDetailPanel } from '../candidate-detail-panel';
import { CandidateRow } from '../candidate-row';
import { CandidateWithdrawalPanel } from '../candidate-withdrawal-panel';
import { TRYOUT_CANDIDATES_STATE_TEST_IDS } from './tryout-candidates-view.constants';
import type { TryoutCandidatesViewProps } from './tryout-candidates-view.types';

/**
 * The staff review of tryout registrations: a redacted list on one side, the
 * selected person's record on the other.
 *
 * The list carries the privacy promise in plain sight — it says contact
 * details and readiness notes never appear here, and the row type makes that
 * true rather than merely stated.
 */
export function TryoutCandidatesView(props: TryoutCandidatesViewProps): React.JSX.Element {
  return (
    <PageShell title={props.pageTitle} testId={TEST_IDS.tryoutCandidatesPage}>
      <section
        data-testid={TEST_IDS.tryoutCandidatesView}
        aria-label={props.pageTitle}
        className="app-tryout-candidates flex flex-col gap-5"
      >
        <header className="app-screen-intro flex flex-col gap-1">
          <h2 className="app-section-panel__title m-0">{props.listHeading}</h2>
          <IonText color="medium">
            <p className="m-0 text-sm">{props.listIntro}</p>
          </IonText>
          <IonNote>{props.listPrivacyNotice}</IonNote>
        </header>

        {props.notice === null ? null : (
          <p className="app-pending-notice m-0" role="status">
            {props.notice}
          </p>
        )}

        <AsyncStateView view={props} variant="list" {...TRYOUT_CANDIDATES_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <div className="app-tryout-candidates__layout flex flex-col gap-5 lg:flex-row">
            <div className="flex flex-1 flex-col gap-3">
              <IonText color="medium">
                <p className="m-0 text-sm">{props.countLabel}</p>
              </IonText>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {props.rows.map((row) => (
                  <li key={row.candidateId}>
                    <CandidateRow view={row} onSelect={props.onSelect} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-1 flex-col gap-4">
              {props.detail === null ? (
                <IonNote>{props.selectPrompt}</IonNote>
              ) : (
                <CandidateDetailPanel view={props.detail} />
              )}
              {props.withdrawal === null ? null : (
                <CandidateWithdrawalPanel view={props.withdrawal} />
              )}
            </div>
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
