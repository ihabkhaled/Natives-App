import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import {
  AppButton,
  AsyncStateView,
  EmptyState,
  PageSeo,
  PageShell,
  SectionPanel,
} from '@/shared/ui';

import { PUBLIC_COMPETITION_DETAIL_STATE_TEST_IDS } from '../../constants/public-showcase-state.constants';
import { PublicCompetitionCard } from '../public-competition-card';
import { PublicLeaderboardTable } from '../public-leaderboard-table';
import { PublicMatchResultsTable } from '../public-match-results-table';
import type { PublicCompetitionDetailViewProps } from './public-competition-detail-view.types';

/** One public competition: the finish, every match score, and the leaderboard. */
export function PublicCompetitionDetailView(
  props: PublicCompetitionDetailViewProps,
): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.publicCompetitionDetailPage}>
      <PageSeo title={props.seoTitle} description={props.seoDescription} path={props.path} />
      <div className="app-showcase-layout">
        <header className="app-showcase-hero">
          <AppButton
            label={props.backLabel}
            tone="ghost"
            onClick={props.onBack}
            testId={TEST_IDS.publicCompetitionBack}
          />
          <IonText>
            <p className="app-eyebrow m-0">{props.heroEyebrow}</p>
          </IonText>
          <IonText>
            <h1 className="m-0 text-3xl font-bold">{props.title}</h1>
          </IonText>
        </header>

        <AsyncStateView
          view={props}
          variant="detail"
          {...PUBLIC_COMPETITION_DETAIL_STATE_TEST_IDS}
        />

        {props.summary === null ? null : (
          <PublicCompetitionCard card={props.summary} labels={props.summaryLabels} />
        )}

        {props.status === 'ready' ? (
          <SectionPanel heading={props.matchesHeading} intro={props.matchesIntro}>
            {props.matches.length === 0 ? (
              <EmptyState
                title={props.matchesLabels.emptyTitle}
                message={props.matchesLabels.emptyMessage}
              />
            ) : (
              <PublicMatchResultsTable
                labels={props.matchesLabels}
                rows={props.matches}
                expandedKey={props.expandedMatchKey}
                onToggle={props.onToggleMatch}
              />
            )}
          </SectionPanel>
        ) : null}

        {props.status === 'ready' ? (
          <SectionPanel heading={props.leaderboardHeading} intro={props.leaderboardIntro}>
            {props.leaderboard.length === 0 ? (
              <EmptyState
                title={props.leaderboardLabels.emptyTitle}
                message={props.leaderboardLabels.emptyMessage}
              />
            ) : (
              <PublicLeaderboardTable labels={props.leaderboardLabels} rows={props.leaderboard} />
            )}
          </SectionPanel>
        ) : null}
      </div>
    </PageShell>
  );
}
