import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageShell, SelectField } from '@/shared/ui';

import { LeaderboardTable } from '../leaderboard-table';
import { LEADERBOARD_STATE_TEST_IDS } from './leaderboard-view.constants';
import type { LeaderboardScreenProps } from './leaderboard-view.types';

/**
 * Team standings: period / cohort / category scopes, the server's tie-break
 * rule stated in plain words, and the table itself. The zero-inclusion notice
 * is part of the screen, not a footnote — members on 0 belong on the board.
 */
export function LeaderboardScreen(props: LeaderboardScreenProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.leaderboardPage}>
      <section
        data-testid={TEST_IDS.leaderboardView}
        aria-label={props.title}
        className="app-leaderboard flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        <div className="app-leaderboard__filters" aria-label={props.filtersHeading}>
          <SelectField
            testId={TEST_IDS.leaderboardPeriodSelect}
            label={props.periodLabel}
            value={props.periodValue}
            options={props.periodOptions}
            onChange={props.onPeriodChange}
          />
          <SelectField
            testId={TEST_IDS.leaderboardCohortSelect}
            label={props.cohortLabel}
            value={props.cohortValue}
            options={props.cohortOptions}
            onChange={props.onCohortChange}
          />
          <SelectField
            testId={TEST_IDS.leaderboardCategorySelect}
            label={props.categoryLabel}
            value={props.categoryValue}
            options={props.categoryOptions}
            onChange={props.onCategoryChange}
          />
        </div>

        <AsyncStateView view={props} variant="list" {...LEADERBOARD_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <>
            <div
              data-testid={TEST_IDS.leaderboardTieRule}
              className="app-surface-card app-tie-rule"
            >
              <span className="app-eyebrow">{props.tieRuleHeading}</span>
              <p className="m-0">{props.tieRuleLabel}</p>
              <IonNote>{props.tieRuleNotice}</IonNote>
              <IonNote>{props.zeroNotice}</IonNote>
            </div>
            <div className="app-leaderboard__meta">
              <IonNote>{props.freshnessLabel}</IonNote>
              <IonNote>{props.countLabel}</IonNote>
            </div>
            <LeaderboardTable view={props} />
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
