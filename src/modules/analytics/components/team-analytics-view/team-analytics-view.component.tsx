import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageShell, SelectField } from '@/shared/ui';

import { AnalyticsFreshnessCard } from '../analytics-freshness-card';
import { AnalyticsSeriesChart } from '../analytics-series-chart';
import { CohortComparisonPanel } from '../cohort-comparison-panel';
import { DimensionPicker } from '../dimension-picker';
import { PeriodTypePicker } from '../period-type-picker';
import { TEAM_ANALYTICS_STATE_TEST_IDS } from './team-analytics-view.constants';
import type { TeamAnalyticsScreenProps } from './team-analytics-view.types';

/**
 * The team analytics screen: controls bar, the governed series chart, then
 * the cohort panel and freshness card side by side on desktop (stacked on
 * mobile). Every number on this screen was computed server-side.
 */
export function TeamAnalyticsScreen(props: TeamAnalyticsScreenProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.analyticsPage}>
      <section
        data-testid={TEST_IDS.analyticsView}
        aria-label={props.title}
        className="app-analytics flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>

        <div className="app-analytics__controls">
          <DimensionPicker controls={props.controls} />
          <PeriodTypePicker controls={props.controls} />
          <SelectField
            testId={TEST_IDS.analyticsPlayerSelect}
            label={props.playerSelectLabel}
            value={props.playerSelectValue}
            options={props.playerOptions}
            onChange={props.onPlayerSelect}
          />
        </div>

        <AsyncStateView view={props} variant="card" {...TEAM_ANALYTICS_STATE_TEST_IDS} />

        {props.status === 'ready' && props.chart !== null ? (
          <>
            <AnalyticsSeriesChart chart={props.chart} />
            <div className="app-analytics__row">
              {props.cohort === null ? null : <CohortComparisonPanel view={props.cohort} />}
              {props.freshness === null ? null : <AnalyticsFreshnessCard view={props.freshness} />}
            </div>
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
