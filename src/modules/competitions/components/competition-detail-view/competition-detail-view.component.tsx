import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import {
  AppButton,
  AsyncStateView,
  FactList,
  PageShell,
  SectionPanel,
  StatusChip,
} from '@/shared/ui';

import { CompetitionFixtureList } from '../competition-fixture-list';
import { CompetitionOpponentList } from '../competition-opponent-list';
import { CompetitionStageList } from '../competition-stage-list';
import { COMPETITION_DETAIL_STATE_TEST_IDS } from './competition-detail-view.constants';
import type { CompetitionDetailViewProps } from './competition-detail-view.types';

/** One competition: summary, published structure, fixtures, opponents. */
export function CompetitionDetailView(props: CompetitionDetailViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.competitionDetailPage}>
      <section
        data-testid={TEST_IDS.competitionDetailView}
        aria-label={props.heading}
        className="app-competition-detail flex flex-col gap-5"
      >
        <AppButton
          label={props.backLabel}
          tone="ghost"
          testId={TEST_IDS.competitionBack}
          onClick={props.onBack}
        />

        <AsyncStateView view={props} variant="detail" {...COMPETITION_DETAIL_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <>
            <header className="app-competition-detail__head">
              <IonText>
                <h1 className="app-competition-detail__title m-0">{props.heading}</h1>
              </IonText>
              <div className="app-competition-detail__chips">
                <StatusChip label={props.statusLabel} tone={props.statusTone} />
                <StatusChip label={props.typeLabel} tone="secondary" />
              </div>
              {props.cancellationNotice === null ? null : (
                <p className="app-competition-detail__notice m-0" role="note">
                  {props.cancellationNotice}
                </p>
              )}
            </header>

            <SectionPanel heading={props.summaryHeading} testId={TEST_IDS.competitionSummary}>
              <FactList items={props.facts} ariaLabel={props.summaryHeading} />
              {props.description === null ? null : (
                <>
                  <h3 className="app-competition-detail__subhead">{props.descriptionHeading}</h3>
                  <p className="m-0 text-sm">{props.description}</p>
                </>
              )}
            </SectionPanel>

            <SectionPanel heading={props.stagesHeading} intro={props.stagesIntro}>
              <CompetitionStageList items={props.stages} emptyLabel={props.stagesEmptyLabel} />
            </SectionPanel>

            <SectionPanel heading={props.fixturesHeading} intro={props.fixturesIntro}>
              <CompetitionFixtureList
                items={props.fixtures}
                emptyLabel={props.fixturesEmptyLabel}
              />
            </SectionPanel>

            <SectionPanel heading={props.opponentsHeading} intro={props.opponentsIntro}>
              <CompetitionOpponentList
                items={props.opponents}
                emptyLabel={props.opponentsEmptyLabel}
              />
            </SectionPanel>
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
